export type TrafficStatus = 'GREEN' | 'AMBER' | 'RED';
export type OrderStageName =
  | 'Patronaje'
  | 'Compras'
  | 'Corte'
  | 'Confección'
  | 'Acabados'
  | 'Calidad'
  | 'Empaque';

export type StageStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE' | 'BLOCKED';

export type OrderStatus =
  | 'PLANIFICACION'
  | 'EN_CURSO'
  | 'TERMINADO'
  | 'CANCELADO';

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

export interface OrderStage {
  id: string;
  orderId: string;
  stage: OrderStageName;
  status: StageStatus;
  startPlanned?: string;
  endPlanned?: string;
  startActual?: string;
  endActual?: string;
  timePlannedMin?: number;
  timeActualMin?: number;
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
  bom?: Array<{ materialId: string; materialName: string; qty: number; uom: string; cost: number }>;
  price?: number;
  laborCost?: number;
  overheadCost?: number;
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

export type MovementType = 'IN' | 'OUT' | 'ADJUST';

export interface Movement {
  id: string;
  type: MovementType;
  materialId: string;
  qty: number;
  ref: string;
  at: string;
  note?: string;
}

export interface Operator {
  id: string;
  name: string;
  puesto: string;
  hourRate: number;
  shift: string;
  active: boolean;
}

export type AttendanceType = 'IN' | 'OUT';

export interface Attendance {
  id: string;
  operatorId: string;
  operatorName: string;
  type: AttendanceType;
  at: string;
  note?: string;
}

export type InvoiceType = 'Cliente' | 'Proveedor';

export interface Invoice {
  id: string;
  invoiceNo: string;
  type: InvoiceType;
  partnerId: string;
  partnerName: string;
  date: string;
  amount: number;
  status: string;
  orderId?: string;
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

export type UserRole = 'admin' | 'manager' | 'operator' | 'viewer';

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

export interface ApiError {
  message: string;
}
