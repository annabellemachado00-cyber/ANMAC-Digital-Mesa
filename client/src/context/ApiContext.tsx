import axios from 'axios';
import React, { createContext, useContext, useMemo } from 'react';
import {
  Attendance,
  Customer,
  DashboardSummary,
  Invoice,
  LoginPayload,
  Material,
  Movement,
  Operator,
  Order,
  Product,
  Settings,
  Supplier,
  User,
} from '../types';

interface ApiContextValue {
  login(payload: LoginPayload): Promise<User>;
  getDashboard(): Promise<DashboardSummary>;
  getOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order>;
  createOrder(order: Partial<Order>): Promise<Order>;
  updateOrder(id: string, order: Partial<Order>): Promise<Order>;
  getProducts(): Promise<Product[]>;
  getMaterials(): Promise<Material[]>;
  getCustomers(): Promise<Customer[]>;
  getSuppliers(): Promise<Supplier[]>;
  getOperators(): Promise<Operator[]>;
  getAttendance(): Promise<Attendance[]>;
  getInvoices(): Promise<Invoice[]>;
  getMovements(): Promise<Movement[]>;
  createMovement(movement: Partial<Movement>): Promise<Movement>;
  applyMovement(id: string): Promise<Material>;
  getSettings(): Promise<Settings>;
  updateSettings(settings: Partial<Settings>): Promise<Settings>;
  exportToSheets(sheetName: string, rows: unknown[]): Promise<string>;
}

const ApiContext = createContext<ApiContextValue | undefined>(undefined);

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const client = useMemo(() => {
    const instance = axios.create({
      baseURL: '/api',
    });
    return instance;
  }, []);

  const value: ApiContextValue = useMemo(
    () => ({
      async login(payload) {
        const { data } = await client.post<User>('/login', payload);
        return data;
      },
      async getDashboard() {
        const { data } = await client.get<DashboardSummary>('/dashboard');
        return data;
      },
      async getOrders() {
        const { data } = await client.get<Order[]>('/orders');
        return data;
      },
      async getOrder(id) {
        const { data } = await client.get<Order>(`/orders/${id}`);
        return data;
      },
      async createOrder(order) {
        const { data } = await client.post<Order>('/orders', order);
        return data;
      },
      async updateOrder(id, order) {
        const { data } = await client.put<Order>(`/orders/${id}`, order);
        return data;
      },
      async getProducts() {
        const { data } = await client.get<Product[]>('/productos');
        return data;
      },
      async getMaterials() {
        const { data } = await client.get<Material[]>('/inventario');
        return data;
      },
      async getCustomers() {
        const { data } = await client.get<Customer[]>('/clientes');
        return data;
      },
      async getSuppliers() {
        const { data } = await client.get<Supplier[]>('/proveedores');
        return data;
      },
      async getOperators() {
        const { data } = await client.get<Operator[]>('/operarias');
        return data;
      },
      async getAttendance() {
        const { data } = await client.get<Attendance[]>('/asistencia');
        return data;
      },
      async getInvoices() {
        const { data } = await client.get<Invoice[]>('/facturas');
        return data;
      },
      async getMovements() {
        const { data } = await client.get<Movement[]>('/movimientos');
        return data;
      },
      async createMovement(movement) {
        const { data } = await client.post<Movement>('/movimientos', movement);
        return data;
      },
      async applyMovement(id) {
        const { data } = await client.post<Material>(`/movimientos/${id}/aplicar`, {});
        return data;
      },
      async getSettings() {
        const { data } = await client.get<Settings>('/settings');
        return data;
      },
      async updateSettings(settings) {
        const { data } = await client.put<Settings>('/settings', settings);
        return data;
      },
      async exportToSheets(sheetName, rows) {
        const normalized = rows.map((row) => ({ ...(row as Record<string, unknown>) }));
        const { data } = await client.post<{ message: string }>('/export/sheets', { sheetName, rows: normalized });
        return data.message;
      },
    }),
    [client]
  );

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};

export const useApi = (): ApiContextValue => {
  const ctx = useContext(ApiContext);
  if (!ctx) {
    throw new Error('useApi debe usarse dentro de ApiProvider');
  }
  return ctx;
};
