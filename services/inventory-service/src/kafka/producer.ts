// services\inventory-service\src\kafka\producer.ts
import { kafka } from '../config/kafka.js';

export const producer = kafka.producer();