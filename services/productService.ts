
import { ref, onValue, push, set, remove, update, get, child, runTransaction } from "firebase/database";
import { db } from "../firebase";
import { Product, SiteContent, Order, CartItem, OrderStatus } from "../types";
import { PRODUCTS, DEFAULT_SITE_CONTENT } from "../constants";

const PRODUCTS_REF = "products";
const SITE_CONTENT_REF = "siteContent";
const ORDERS_REF = "orders";

// Subscribe to real-time product updates
export const subscribeToProducts = (callback: (products: Product[]) => void) => {
  const productsRef = ref(db, PRODUCTS_REF);
  return onValue(productsRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const productList = Object.entries(data).map(([key, value]: [string, any]) => ({
        ...value,
        id: key,
        // Critical: Ensure stock is a valid number, default to 0 if undefined
        stock: typeof value.stock === 'number' ? value.stock : 0
      }));
      callback(productList);
    } else {
      callback([]);
    }
  });
};

// Subscribe to real-time site content updates
export const subscribeToSiteContent = (callback: (content: SiteContent) => void) => {
  const contentRef = ref(db, SITE_CONTENT_REF);
  return onValue(contentRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      callback(data);
    } else {
      callback(DEFAULT_SITE_CONTENT);
    }
  });
};

// Seed initial data if database is empty
export const seedProductsIfEmpty = () => {
  const productsRef = ref(db, PRODUCTS_REF);
  onValue(productsRef, (snapshot) => {
    if (!snapshot.exists()) {
      console.log("Seeding products...");
      PRODUCTS.forEach(product => {
        const { id, ...productData } = product; 
        push(productsRef, productData);
      });
    }
  }, { onlyOnce: true });

  const contentRef = ref(db, SITE_CONTENT_REF);
  onValue(contentRef, (snapshot) => {
    if (!snapshot.exists()) {
      console.log("Seeding site content...");
      set(contentRef, DEFAULT_SITE_CONTENT);
    }
  }, { onlyOnce: true });
};

// Product Actions
export const addProduct = (product: Omit<Product, 'id'>) => {
  const productsRef = ref(db, PRODUCTS_REF);
  return push(productsRef, product);
};

export const updateProduct = (id: string, updates: Partial<Omit<Product, 'id'>>) => {
  const productRef = ref(db, `${PRODUCTS_REF}/${id}`);
  return update(productRef, updates);
};

export const deleteProduct = (id: string) => {
  const productRef = ref(db, `${PRODUCTS_REF}/${id}`);
  return remove(productRef);
};

// Site Content Actions
export const updateSiteContent = (content: SiteContent) => {
  const contentRef = ref(db, SITE_CONTENT_REF);
  return set(contentRef, content);
};

// --- ORDER ACTIONS ---

export const subscribeToOrders = (callback: (orders: Order[]) => void) => {
  const ordersRef = ref(db, ORDERS_REF);
  return onValue(ordersRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      const orderList = Object.values(data) as Order[];
      // Sort by date descending (newest first)
      orderList.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      callback(orderList);
    } else {
      callback([]);
    }
  });
};

export const updateOrderStatus = (orderId: string, status: OrderStatus) => {
  const orderRef = ref(db, `${ORDERS_REF}/${orderId}`);
  return update(orderRef, { status });
};

export const createOrder = async (orderData: Omit<Order, 'id'>, items: CartItem[]) => {
  const ordersRef = ref(db, ORDERS_REF);
  const orderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
  
  // 1. VALIDATION: Check stock for all items first
  for (const item of items) {
    const productRef = ref(db, `${PRODUCTS_REF}/${item.id}`);
    const snapshot = await get(productRef);
    const product = snapshot.val();

    if (!snapshot.exists() || !product) {
      throw new Error(`Product "${item.name}" is no longer available.`);
    }

    const currentStock = product.stock ?? 0;
    if (currentStock < item.quantity) {
      throw new Error(`Insufficient stock for "${item.name}". Only ${currentStock} left.`);
    }
  }

  // Sanitize items to ensure no undefined values
  const sanitizedItems = items.map(item => ({
    ...item,
    stock: item.stock || 0
  }));

  // 2. CREATE ORDER
  const newOrderRef = child(ordersRef, orderId);
  await set(newOrderRef, { ...orderData, items: sanitizedItems, id: orderId });

  // 3. UPDATE STOCK (Transactional)
  const updatePromises = items.map(item => {
    const stockRef = ref(db, `${PRODUCTS_REF}/${item.id}/stock`);
    return runTransaction(stockRef, (currentStock) => {
      const stock = currentStock || 0;
      if (stock < item.quantity) {
        return; // Abort if stock changed
      }
      return stock - item.quantity;
    });
  });

  await Promise.all(updatePromises);

  return orderId;
};

export const getOrder = async (orderId: string): Promise<Order | null> => {
  const orderRef = ref(db, `${ORDERS_REF}/${orderId}`);
  const snapshot = await get(orderRef);
  if (snapshot.exists()) {
    return snapshot.val() as Order;
  }
  return null;
};
