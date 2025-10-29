import { nanoid } from 'nanoid';
import { seeds } from './seeds';
import {
  Attendance,
  Customer,
  Invoice,
  Material,
  Movement,
  Operator,
  Order,
  OrderItem,
  OrderStage,
  Product,
  Settings,
  Supplier,
  User,
} from '../types';

export interface Database {
  customers: Customer[];
  suppliers: Supplier[];
  materials: Material[];
  products: Product[];
  orders: Order[];
  orderItems: OrderItem[];
  orderStages: OrderStage[];
  operators: Operator[];
  attendance: Attendance[];
  invoices: Invoice[];
  movements: Movement[];
  settings: Settings;
  users: User[];
}

const db: Database = JSON.parse(JSON.stringify(seeds));

type CollectionName = keyof Omit<Database, 'settings'>;

type EntityMap = {
  customers: Customer;
  suppliers: Supplier;
  materials: Material;
  products: Product;
  orders: Order;
  orderItems: OrderItem;
  orderStages: OrderStage;
  operators: Operator;
  attendance: Attendance;
  invoices: Invoice;
  movements: Movement;
  users: User;
};

export const list = <K extends CollectionName>(collection: K): EntityMap[K][] => {
  return db[collection] as EntityMap[K][];
};

export const getById = <K extends CollectionName>(collection: K, id: string): EntityMap[K] | undefined => {
  const items = db[collection] as EntityMap[K][];
  return items.find((item) => (item as any).id === id);
};

export const create = <K extends CollectionName>(collection: K, payload: Omit<EntityMap[K], 'id'>): EntityMap[K] => {
  const newItem = { id: nanoid(), ...(payload as object) } as EntityMap[K];
  const items = db[collection] as EntityMap[K][];
  items.push(newItem);
  return newItem;
};

export const update = <K extends CollectionName>(collection: K, id: string, payload: Partial<EntityMap[K]>): EntityMap[K] | null => {
  const items = db[collection] as EntityMap[K][];
  const index = items.findIndex((item) => (item as any).id === id);
  if (index === -1) {
    return null;
  }
  const updated = { ...items[index], ...(payload as object) } as EntityMap[K];
  items[index] = updated;
  return updated;
};

export const remove = <K extends CollectionName>(collection: K, id: string): boolean => {
  const items = db[collection] as EntityMap[K][];
  const index = items.findIndex((item) => (item as any).id === id);
  if (index === -1) {
    return false;
  }
  items.splice(index, 1);
  return true;
};

export const getSettings = (): Settings => db.settings;

export const updateSettings = (payload: Partial<Settings>): Settings => {
  db.settings = { ...db.settings, ...payload };
  if (payload.alerts) {
    db.settings.alerts = { ...db.settings.alerts, ...payload.alerts };
  }
  if (payload.locale) {
    db.settings.locale = { ...db.settings.locale, ...payload.locale };
  }
  if (payload.printing) {
    db.settings.printing = { ...db.settings.printing, ...payload.printing };
  }
  return db.settings;
};

export const reset = () => {
  const fresh: Database = JSON.parse(JSON.stringify(seeds));
  (Object.keys(fresh) as (keyof Database)[]).forEach((key) => {
    // @ts-expect-error overriding
    db[key] = fresh[key];
  });
};
