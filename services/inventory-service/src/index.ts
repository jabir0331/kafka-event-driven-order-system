// services\inventory-service\src\index.ts
import { consumer } from "./kafka/consumer.js";
import { reserveInventory, getInventory } from "./inventory/inventory.service.js";

async function main() {
  await consumer.connect();

  console.log("Kafka consumer connected successfully!");

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

      if (result.success) {
        console.log("SUCCESS:", result.message);
      } else {
        console.log("FAILED:", result.message);
      }

      console.log("Current inventory:", getInventory());
    },
  });
}

main().catch(console.error);