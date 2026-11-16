export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  stock: number;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface HeroContent {
  headlinePart1: string;
  headlinePart2: string;
  subheadline: string;
  buttonText: string;
  image: string;
}

export interface CollectionItem {
  id: number;
  name: string;
  image: string;
}

export interface SiteContent {
  hero: HeroContent;
  collections: CollectionItem[];
}

export type OrderStatus = 'Processing' | 'Shipped' | 'Out for Delivery' | 'Delivered';

export interface Order {
  id: string;
  items: CartItem[];
  total: number;
  date: string;
  status: OrderStatus;
  customer: {
    name: string;
    email: string;
    address: string;
  };
}

export enum View {
  HOME = 'HOME',
  SHOP = 'SHOP',
  COLLECTIONS = 'COLLECTIONS',
  ADMIN = 'ADMIN',
  TRACK_ORDER = 'TRACK_ORDER'
}
