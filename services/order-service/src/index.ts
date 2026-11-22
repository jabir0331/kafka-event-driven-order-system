// services\order-service\src\index.ts
import express from "express";
import { producer } from "./kafka/producer.js";
import { consumer } from "./kafka/consumer.js";
import { orders, type Order } from "./orders/order.store.js";

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

        orders.set(orderId, order);

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

app.get("/orders/:orderId", (req, res) => {
    const { orderId } = req.params;

    const order = orders.get(orderId);

    if(!order) {
        res.status(404).json({
            message: "Order not found"
        });
        return;
    }

    res.status(200).json(order);
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

            const order = orders.get(event.orderId);

            if (!order) {
                console.log(`Order ${event.orderId} not found in local store`);
                return;
            }

            if (topic === "inventory.reserved") {
                order.status = "RESERVED";

                console.log("\nOrder inventory successfully reserved:");
                console.log(event);
            } else if (topic === "inventory.rejected") {
                order.status = "REJECTED";

                console.log("\nOrder inventory reservation rejected:");
                console.log(event);
            }
        },
    });

    app.listen(PORT, () => {
        console.log(`Order Service running on port ${PORT}`);
    });
}

main().catch(console.error);