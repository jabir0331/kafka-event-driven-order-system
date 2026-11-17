// services\order-service\src\index.ts
import express from "express";
import { producer } from "./kafka/producer.js";

const app = express();

app.use(express.json());

app.post("/orders", async (req, res) => {
    try {
        const { customerId, amount } = req.body;

        const orderId = `ORD-${Date.now()}`;

        const order = {
            orderId,
            customerId,
            amount,
            status: "CREATED",
        };

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

const PORT = 3000;

async function main() {
    await producer.connect();

    console.log("Kafka producer connected successfully!");

    app.listen(PORT, () => {
        console.log(`Order Service running on port ${PORT}`);
    });
}

main().catch(console.error);