// services\order-service\src\config\kafka.ts
import { Kafka } from "kafkajs";

export const kafka = new Kafka({
    clientId: "order-service",
    brokers: ["localhost:9092"],
});