export type OrderStatus =
  | 'accepted'
  | 'pending'
  | 'delivered'
  | 'paid'
  | 'unpaid'
  | 'not_delivered'
  | 'refused';

export type DeliveryMode = 'pickup' | 'delivery';

export interface Order {
  id: string;
  restaurantName?: string;
  producerName?: string;
  total: number;
  status: OrderStatus;
  deliveryMode: DeliveryMode;
  date: string;
  time: string;
}
