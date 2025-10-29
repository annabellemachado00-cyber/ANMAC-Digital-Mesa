export type TrafficStatus = 'GREEN' | 'AMBER' | 'RED';

export type OrderStatus = 'PLANIFICACION' | 'EN_CURSO' | 'TERMINADO' | 'CANCELADO';

export interface OrderStage {
  id: string;
  orderId: string;
  stage: 'Patronaje' | 'Compras' | 'Corte' | 'Confección' | 'Acabados' | 'Calidad' | 'Empaque';
  status: 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED';
  startPlanned?: string;
  endPlanned?: string;
  startActual?: string;
  endActual?: string;
  timePlannedMin?: number;
  timeActualMin?: number;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productSku: string;
  productName: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  code: string;
  clientId: string;
  status: OrderStatus;
  amount: number;
  orderDate: string;
  promisedDate: string;
  estimatedShipDate?: string;
  actualShipDate?: string;
  slackDays: number;
  traffic: TrafficStatus;
  stages: OrderStage[];
  progress: number;
  items: OrderItem[];
  client?: Customer | null;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  skuShort: string;
  category: string;
  silhouette: string;
  season: string;
  color: string;
  size: string;
  program: string;
  fit: string;
  gender: string;
  revision: string;
  stdTimeMin: number;
  price?: number;
  laborCost?: number;
  overheadCost?: number;
  bom?: Array<{ materialId: string; materialName: string; qty: number; uom: string; cost: number }>;
}

export interface Material {
  id: string;
  name: string;
  uom: string;
  onHand: number;
  reserved: number;
  available: number;
  reorderPoint: number;
  supplierId: string;
  supplierName: string;
  lot: string;
  statusStock: 'Normal' | 'Bajo' | 'Crítico';
}

export interface Supplier {
  id: string;
  name: string;
  taxId: string;
  email: string;
  phone: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
}

export interface Operator {
  id: string;
  name: string;
  puesto: string;
  hourRate: number;
  shift: string;
  active: boolean;
}

export interface Attendance {
  id: string;
  operatorId: string;
  operatorName: string;
  type: 'IN' | 'OUT';
  at: string;
  note?: string;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  type: 'Cliente' | 'Proveedor';
  partnerId: string;
  partnerName: string;
  date: string;
  amount: number;
  status: string;
  orderId?: string;
}

export interface Movement {
  id: string;
  type: 'IN' | 'OUT' | 'ADJUST';
  materialId: string;
  qty: number;
  ref: string;
  at: string;
  note?: string;
}

export interface Settings {
  alerts: {
    orderDays: number;
  };
  locale: {
    currency: string;
  };
  printing: {
    header: boolean;
    logoUrl?: string;
  };
}

export interface DashboardSummary {
  total: number;
  finished: number;
  inProgress: number;
  revenue: number;
  traffic: Record<TrafficStatus, number>;
  recent: Order[];
}

export type UserRole = 'admin' | 'manager' | 'operator' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface LoginPayload {
  email: string;
  password: string;
}
