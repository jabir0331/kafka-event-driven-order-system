import { producer } from "./kafka/producer.js";

async function main() {
    await producer.connect();

    console.log("Kafka producer connected successfully!");

    await producer.send({
        topic: "orders.created",
        messages: [
            {
                key: "customer-001",
                value: JSON.stringify({
                    orderId: "ORD-008",
                    customerId: "customer-001",
                    amount: 3500,
                    status: "CREATED",
                }),
            },
        ],
    });

    console.log("Order event published successfully!");

    await producer.disconnect();
}

main().catch(console.error);