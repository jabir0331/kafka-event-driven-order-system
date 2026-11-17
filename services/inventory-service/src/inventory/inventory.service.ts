import { inventory, processedOrders } from "./inventory.js";

interface OrderItem {
    productId: string;
    quantity: number;
}

interface Order {
    orderId: string;
    customerId: string;
    items: OrderItem[];
    amount: number;
    status: string;
}

export function reserveInventory(order: Order) {
    // Step 1: Check for duplicate orders
    if (processedOrders.has(order.orderId)) {
        return {
            success: true,
            duplicate: true,
            message: `Order ${order.orderId} has already been processed`,
        };
    }

    // Step 2: Validate all products
    for (const item of order.items) {
        const availableStock = inventory.get(item.productId);

        if (availableStock === undefined) {
            return {
                success: false,
                duplicate: false,
                message: `Product ${item.productId} does not exist`,
            };
        }

        if (availableStock < item.quantity) {
            return {
                success: false,
                duplicate: false,
                message: `Insufficient stock for ${item.productId}`,
            };
        }
    }

    // Step 3: Reserve stock
    for (const item of order.items) {
        const availableStock = inventory.get(item.productId)!;

        inventory.set(
            item.productId,
            availableStock - item.quantity
        );
    }

    // Step 4: Mark order as successfully processed
    processedOrders.add(order.orderId);

    return {
        success: true,
        duplicate: false,
        message: "Inventory reserved successfully",
    };
}

export function getInventory() {
    return Object.fromEntries(inventory);
}