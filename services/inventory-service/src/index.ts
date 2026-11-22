// services\inventory-service\src\index.ts
import { consumer } from "./kafka/consumer.js";
import { producer } from "./kafka/producer.js";
import { getInventory, reserveInventory } from "./inventory/inventory.service.js";

async function main() {
  await consumer.connect();
  await producer.connect();

  console.log("Kafka consumer connected successfully!");
  console.log("Kafka producer connected successfully!");

  await consumer.subscribe({
    topic: "orders.created",
    fromBeginning: true,
  });

  console.log("Subscribed to orders.created");

  await consumer.run({
    eachMessage: async ({ message }) => {
      if (!message.value) {
        console.log("Received an empty Kafka message");
        return;
      }

      const order = JSON.parse(message.value.toString());

      console.log("\nReceived order:", order.orderId);

      const result = reserveInventory(order);

      if (result.duplicate) {
        console.log("DUPLICATE:", result.message);
      } else if (result.success) {
        console.log("SUCCESS:", result.message);

        await producer.send({
          topic: "inventory.reserved",
          messages: [
            {
              key: order.orderId,
              value: JSON.stringify({
                orderId: order.orderId,
                customerId: order.customerId,
                status: "RESERVED",
                message: result.message,
              }),
            }
          ]
        });

        console.log("Published inventory.reserved:", order.orderId);
      } else {
        console.log("FAILED:", result.message);
      }

      console.log("Current inventory:", getInventory());
    },
  });
}

main().catch(console.error);