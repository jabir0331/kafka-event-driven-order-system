// services\inventory-service\src\kafka\consumer.ts
import { kafka } from "../config/kafka.js";

export const consumer = kafka.consumer({
  groupId: "inventory-service",
});