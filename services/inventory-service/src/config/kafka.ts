// services\inventory-service\src\config\kafka.ts
import { Kafka } from "kafkajs";

export const kafka = new Kafka({
    clientId: "inventory-service",
    brokers: ["localhost:9092"],
});