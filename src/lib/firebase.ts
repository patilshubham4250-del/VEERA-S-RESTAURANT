import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  deleteDoc, 
  writeBatch 
} from 'firebase/firestore';
import { MenuItem, Order, DailyArchive } from '../types';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp({
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId
});

// Initialize Firestore with custom database ID from config
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

export interface CloudConfig {
  gstRate: number;
  sessionBillingDate: string | null;
  autoBackup: boolean;
}

/**
 * Clean up objects/arrays recursively by stripping out undefined fields
 * so that they are fully compatible with Firebase Firestore.
 */
function cleanData<T>(val: T): T {
  if (val === undefined) {
    return null as unknown as T;
  }
  if (val === null) {
    return null as unknown as T;
  }
  if (Array.isArray(val)) {
    return val.map(item => cleanData(item)) as unknown as T;
  }
  if (typeof val === 'object') {
    if (Object.prototype.toString.call(val) !== '[object Object]') {
      return val;
    }
    const cleaned: Record<string, any> = {};
    for (const key of Object.keys(val)) {
      const fieldVal = (val as any)[key];
      if (fieldVal !== undefined) {
        cleaned[key] = cleanData(fieldVal);
      }
    }
    return cleaned as unknown as T;
  }
  return val;
}

/**
 * Seed initial data to the cloud if database is completely empty
 */
export async function seedCloudDatabaseIfEmpty(
  defaultMenuItems: MenuItem[],
  defaultOrders: Order[] = []
) {
  try {
    const menuRef = doc(db, 'settings', 'menu');
    const menuSnap = await getDoc(menuRef);
    
    if (!menuSnap.exists()) {
      // Seed Menu Items
      await setDoc(menuRef, cleanData({ list: defaultMenuItems }));
      
      // Seed Config
      await setDoc(doc(db, 'settings', 'config'), cleanData({
        gstRate: 5,
        sessionBillingDate: null,
        autoBackup: true
      }));
      
      // Seed Orders
      if (defaultOrders.length > 0) {
        for (const order of defaultOrders) {
          await setDoc(doc(db, 'orders', order.id), cleanData(order));
        }
      }
      console.log('Cloud Database seeded successfully with default values!');
    }
  } catch (error) {
    console.error('Error seeding cloud database:', error);
  }
}

/**
 * Fetch all data from the cloud database
 */
export async function fetchAllCloudData() {
  try {
    // 1. Fetch Menu
    const menuSnap = await getDoc(doc(db, 'settings', 'menu'));
    const menuItems = menuSnap.exists() ? (menuSnap.data().list as MenuItem[]) : null;

    // 2. Fetch Config
    const configSnap = await getDoc(doc(db, 'settings', 'config'));
    const config = configSnap.exists() ? (configSnap.data() as CloudConfig) : null;

    // 3. Fetch Active Orders
    const ordersSnap = await getDocs(collection(db, 'orders'));
    const orders: Order[] = [];
    ordersSnap.forEach((docSnap) => {
      orders.push(docSnap.data() as Order);
    });
    // Sort orders by timestamp descending
    orders.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // 4. Fetch Daily Archives
    const archivesSnap = await getDocs(collection(db, 'archives'));
    const dailyArchives: DailyArchive[] = [];
    archivesSnap.forEach((docSnap) => {
      dailyArchives.push(docSnap.data() as DailyArchive);
    });
    // Sort archives by timestamp descending
    dailyArchives.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return {
      menuItems,
      config,
      orders,
      dailyArchives
    };
  } catch (error) {
    console.error('Error fetching cloud data:', error);
    throw error;
  }
}

/**
 * Save menu items to Firestore
 */
export async function saveMenuItemsToCloud(items: MenuItem[]) {
  const menuRef = doc(db, 'settings', 'menu');
  await setDoc(menuRef, cleanData({ list: items }));
}

/**
 * Save configuration settings to Firestore
 */
export async function saveConfigToCloud(config: Partial<CloudConfig>) {
  const configRef = doc(db, 'settings', 'config');
  await setDoc(configRef, cleanData(config), { merge: true });
}

/**
 * Save or update a single active order
 */
export async function saveOrderToCloud(order: Order) {
  const orderRef = doc(db, 'orders', order.id);
  await setDoc(orderRef, cleanData(order));
}

/**
 * Delete a single active order
 */
export async function deleteOrderFromCloud(orderId: string) {
  const orderRef = doc(db, 'orders', orderId);
  await deleteDoc(orderRef);
}

/**
 * Clear all active orders from Cloud (e.g. on close day or reset)
 */
export async function clearAllOrdersFromCloud(orderIds: string[]) {
  const batch = writeBatch(db);
  orderIds.forEach((id) => {
    batch.delete(doc(db, 'orders', id));
  });
  await batch.commit();
}

/**
 * Save a closed day archive record
 */
export async function saveArchiveToCloud(archive: DailyArchive) {
  const archiveRef = doc(db, 'archives', archive.id);
  await setDoc(archiveRef, cleanData(archive));
}

/**
 * Delete a daily archive from Cloud
 */
export async function deleteArchiveFromCloud(archiveId: string) {
  const archiveRef = doc(db, 'archives', archiveId);
  await deleteDoc(archiveRef);
}
