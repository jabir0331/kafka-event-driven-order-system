import { inventory } from "./inventory.js";

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
  // Step 1: Check whether all products have sufficient stock
  for (const item of order.items) {
    const availableStock = inventory.get(item.productId);

    if (availableStock === undefined) {
      return {
        success: false,
        message: `Product ${item.productId} does not exist`,
      };
    }

    if (availableStock < item.quantity) {
      return {
        success: false,
        message: `Insufficient stock for ${item.productId}`,
      };
    }
  }

  // Step 2: Reserve stock only after all checks pass
  for (const item of order.items) {
    const availableStock = inventory.get(item.productId)!;

    inventory.set(
      item.productId,
      availableStock - item.quantity
    );
  }

  return {
    success: true,
    message: "Inventory reserved successfully",
  };
}

export function getInventory() {
  return Object.fromEntries(inventory);
}