import { z } from 'zod';

export const idParam = z.object({
  id: z.string().min(1),
});

export const orderSchema = z.object({
  code: z.string(),
  clientId: z.string(),
  status: z.enum(['PLANIFICACION', 'EN_CURSO', 'TERMINADO', 'CANCELADO']),
  amount: z.number().nonnegative(),
  orderDate: z.string(),
  promisedDate: z.string(),
  estimatedShipDate: z.string().optional(),
  actualShipDate: z.string().optional(),
});

export const orderItemSchema = z.object({
  orderId: z.string(),
  productId: z.string(),
  productSku: z.string(),
  productName: z.string(),
  qty: z.number().nonnegative(),
  unitPrice: z.number().nonnegative(),
  lineTotal: z.number().nonnegative(),
});

export const orderStageSchema = z.object({
  orderId: z.string(),
  stage: z.enum(['Patronaje', 'Compras', 'Corte', 'Confección', 'Acabados', 'Calidad', 'Empaque']),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'DONE', 'BLOCKED']),
  startPlanned: z.string().optional(),
  endPlanned: z.string().optional(),
  startActual: z.string().optional(),
  endActual: z.string().optional(),
  timePlannedMin: z.number().optional(),
  timeActualMin: z.number().optional(),
});

export const productSchema = z.object({
  name: z.string(),
  sku: z.string(),
  skuShort: z.string(),
  category: z.string(),
  silhouette: z.string(),
  season: z.string(),
  color: z.string(),
  size: z.string(),
  program: z.string(),
  fit: z.string(),
  gender: z.string(),
  revision: z.string(),
  stdTimeMin: z.number().nonnegative(),
  price: z.number().optional(),
  laborCost: z.number().optional(),
  overheadCost: z.number().optional(),
  bom: z
    .array(
      z.object({
        materialId: z.string(),
        materialName: z.string(),
        qty: z.number().positive(),
        uom: z.string(),
        cost: z.number().nonnegative(),
      })
    )
    .optional(),
});

export const materialSchema = z.object({
  name: z.string(),
  uom: z.string(),
  onHand: z.number(),
  reserved: z.number(),
  available: z.number(),
  reorderPoint: z.number(),
  supplierId: z.string(),
  supplierName: z.string(),
  lot: z.string(),
});

export const supplierSchema = z.object({
  name: z.string(),
  taxId: z.string(),
  email: z.string().email(),
  phone: z.string(),
});

export const customerSchema = z.object({
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
});

export const movementSchema = z.object({
  type: z.enum(['IN', 'OUT', 'ADJUST']),
  materialId: z.string(),
  qty: z.number(),
  ref: z.string(),
  at: z.string(),
  note: z.string().optional(),
});

export const operatorSchema = z.object({
  name: z.string(),
  puesto: z.string(),
  hourRate: z.number().nonnegative(),
  shift: z.string(),
  active: z.boolean(),
});

export const attendanceSchema = z.object({
  operatorId: z.string(),
  operatorName: z.string(),
  type: z.enum(['IN', 'OUT']),
  at: z.string(),
  note: z.string().optional(),
});

export const invoiceSchema = z.object({
  invoiceNo: z.string(),
  type: z.enum(['Cliente', 'Proveedor']),
  partnerId: z.string(),
  partnerName: z.string(),
  date: z.string(),
  amount: z.number().nonnegative(),
  status: z.string(),
  orderId: z.string().optional(),
});

export const settingsSchema = z.object({
  alerts: z
    .object({
      orderDays: z.number().nonnegative(),
    })
    .optional(),
  locale: z
    .object({
      currency: z.enum(['MXN', 'USD', 'EUR']),
    })
    .optional(),
  printing: z
    .object({
      header: z.boolean(),
      logoUrl: z.string().optional(),
    })
    .optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(4),
});

export const exportSchema = z.object({
  sheetName: z.string().min(1),
  rows: z.array(z.record(z.string(), z.any())),
});
