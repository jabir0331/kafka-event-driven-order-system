export interface OrderItem {
    productId: string;
    quantity: number;
}

export interface Order {
    orderId: string;
    customerId: string;
    items: OrderItem[];
    amount: number;
    status: "CREATED" | "RESERVED" | "REJECTED";
}

export const orders = new Map<string, Order>();