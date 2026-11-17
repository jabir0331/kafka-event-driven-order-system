// services\inventory-service\src\inventory\inventory.ts
export const inventory = new Map<string, number>([
    ["product-001", 10],
    ["product-002", 5],
    ["product-003", 20],
]);

export const processedOrders = new Set<string>();