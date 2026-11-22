import { kafka } from '../config/kafka.js';

export const consumer = kafka.consumer({ 
    groupId: "order-service" 
});