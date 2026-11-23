// services\order-service\src\index.ts
import express from "express";
import { producer } from "./kafka/producer.js";
import { consumer } from "./kafka/consumer.js";
import { prisma } from "./config/prisma.js";
import type { Order } from "./orders/order.types.js";

const app = express();

app.use(express.json());

app.post("/orders", async (req, res) => {
    try {
        const { customerId, items, amount } = req.body;

        const orderId = `ORD-${Date.now()}`;

        const order: Order = {
            orderId,
            customerId,
            items,
            amount,
            status: "CREATED",
        };

        await prisma.order.create({
            data: {
                ...order,
                items: order.items.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                })),
            },
        });

        await producer.send({
            topic: "orders.created",
            messages: [
                {
                    key: customerId,
                    value: JSON.stringify(order),
                },
            ],
        });

        console.log("Order event published:", order);

        res.status(201).json(order);
    } catch (error) {
        console.error("Failed to create order:", error);

        res.status(500).json({
            message: "Failed to create order",
        });
    }
});

app.get("/orders/:orderId", async (req, res) => {
    try {
        const order = await prisma.order.findUnique({
            where: {
                orderId: req.params.orderId,
            },
        });

        if (!order) {
            return res.status(404).json({
                message: "Order not found",
            });
        }

        return res.status(200).json(order);
    } catch (error) {
        console.error("Failed to fetch order:", error);

        return res.status(500).json({
            message: "Failed to fetch order",
        });
    }

});

const PORT = 3000;

async function main() {
    await producer.connect();
    await consumer.connect();

    console.log("Kafka producer connected successfully!");
    console.log("Kafka consumer connected successfully!");

    await consumer.subscribe({
        topic: "inventory.reserved",
        fromBeginning: true,
    });

    await consumer.subscribe({
        topic: "inventory.rejected",
        fromBeginning: true,
    });

    console.log("Subscribed to inventory response topics");

    await consumer.run({
        eachMessage: async ({ topic, message }) => {
            if (!message.value) {
                console.log("Received an empty Kafka message");
                return;
            }

            const event = JSON.parse(message.value.toString());

            const newStatus = topic === "inventory.reserved" ? "RESERVED" : "REJECTED";

            try {
                const order = await prisma.order.findUnique({
                    where: {
                        orderId: event.orderId,
                    },
                });

                if (!order) {
                    console.log(`Order ${event.orderId} not found in database`);
                    return;
                }

                await prisma.order.update({
                    where: {
                        orderId: event.orderId,
                    },
                    data: {
                        status: newStatus,
                    },
                });

                if (topic === "inventory.reserved") {
                    console.log("\nOrder inventory successfully reserved:");
                } else {
                    console.log("\nOrder inventory reservation rejected:");
                }

                console.log(event);
            } catch (error) {
                console.error(`Failed to update order ${event.orderId}:`, error);
                throw error;
            }
        },
    });

    app.listen(PORT, () => {
        console.log(`Order Service running on port ${PORT}`);
    });
}

main().catch(console.error);