// services\inventory-service\src\index.ts
import { consumer } from "./kafka/consumer.js";

async function main() {
  await consumer.connect();

  console.log("Kafka consumer connected successfully!");

  await consumer.subscribe({
    topic: "orders.created",
    fromBeginning: true,
  });

  console.log("Subscribed to orders.created");

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log({
        topic,
        partition,
        offset: message.offset,
        key: message.key?.toString(),
        value: message.value?.toString(),
      });
    },
  });
}

main().catch(console.error);