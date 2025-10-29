import { addDays, subDays } from 'date-fns';
import { nanoid } from 'nanoid';
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

const today = new Date();
const format = (date: Date) => date.toISOString();

const clientA: Customer = {
  id: nanoid(),
  name: 'Atelier Aurora',
  email: 'compras@aurora.mx',
  phone: '+52 55 0000 0001',
};

const clientB: Customer = {
  id: nanoid(),
  name: 'Boutique Boreal',
  email: 'ventas@boreal.mx',
  phone: '+52 55 0000 0002',
};

const supplierA: Supplier = {
  id: nanoid(),
  name: 'Textiles Luna',
  taxId: 'LUN920101AA1',
  email: 'contacto@textilesluna.mx',
  phone: '+52 55 1000 1000',
};

const supplierB: Supplier = {
  id: nanoid(),
  name: 'Botones Sol',
  taxId: 'SOL931201BB2',
  email: 'ventas@botonessol.mx',
  phone: '+52 55 1000 2000',
};

const materials: Material[] = [
  {
    id: nanoid(),
    name: 'Lona premium azul',
    uom: 'm',
    onHand: 120,
    reserved: 40,
    available: 80,
    reorderPoint: 50,
    supplierId: supplierA.id,
    supplierName: supplierA.name,
    lot: 'LONA-2403',
  },
  {
    id: nanoid(),
    name: 'Forro satín marfil',
    uom: 'm',
    onHand: 60,
    reserved: 55,
    available: 5,
    reorderPoint: 20,
    supplierId: supplierA.id,
    supplierName: supplierA.name,
    lot: 'FOR-1122',
  },
  {
    id: nanoid(),
    name: 'Botón nacarado 18mm',
    uom: 'pz',
    onHand: 15,
    reserved: 20,
    available: -5,
    reorderPoint: 40,
    supplierId: supplierB.id,
    supplierName: supplierB.name,
    lot: 'BTN-555',
  },
  {
    id: nanoid(),
    name: 'Hilo poliamida azul',
    uom: 'cono',
    onHand: 30,
    reserved: 5,
    available: 25,
    reorderPoint: 10,
    supplierId: supplierB.id,
    supplierName: supplierB.name,
    lot: 'HILO-2024',
  },
  {
    id: nanoid(),
    name: 'Etiqueta bordada dorada',
    uom: 'pz',
    onHand: 200,
    reserved: 20,
    available: 180,
    reorderPoint: 50,
    supplierId: supplierB.id,
    supplierName: supplierB.name,
    lot: 'ETQ-0101',
  },
  {
    id: nanoid(),
    name: 'Cierre metálico 40cm',
    uom: 'pz',
    onHand: 35,
    reserved: 10,
    available: 25,
    reorderPoint: 15,
    supplierId: supplierA.id,
    supplierName: supplierA.name,
    lot: 'ZIP-7788',
  },
];

const productBolero: Product = {
  id: nanoid(),
  name: 'Bolero Aurora',
  sku: 'BLR-AUR-SS24-AZ-M',
  skuShort: 'BLR-AZ-M',
  category: 'Exterior',
  silhouette: 'Bolero',
  season: 'SS24',
  color: 'Azul medianoche',
  size: 'M',
  program: 'Resort',
  fit: 'Regular',
  gender: 'Femenino',
  revision: 'R1',
  stdTimeMin: 185,
  price: 2400,
  laborCost: 350,
  overheadCost: 110,
  bom: [
    {
      materialId: materials[0].id,
      materialName: materials[0].name,
      qty: 2.5,
      uom: 'm',
      cost: 420,
    },
    {
      materialId: materials[2].id,
      materialName: materials[2].name,
      qty: 10,
      uom: 'pz',
      cost: 150,
    },
  ],
};

const productVestido: Product = {
  id: nanoid(),
  name: 'Vestido Boreal',
  sku: 'VST-BOR-AW24-MF-L',
  skuShort: 'VST-MF-L',
  category: 'Vestidos',
  silhouette: 'Línea A',
  season: 'AW24',
  color: 'Marfil',
  size: 'L',
  program: 'Ceremonia',
  fit: 'Slim',
  gender: 'Femenino',
  revision: 'R2',
  stdTimeMin: 240,
  price: 3200,
  laborCost: 420,
  overheadCost: 160,
};

const products: Product[] = [productBolero, productVestido];

const baseStages = (orderId: string): OrderStage[] => {
  const stageNames = [
    'Patronaje',
    'Compras',
    'Corte',
    'Confección',
    'Acabados',
    'Calidad',
    'Empaque',
  ] as const;
  return stageNames.map((stage, index) => ({
    id: nanoid(),
    orderId,
    stage,
    status: index === 0 ? 'IN_PROGRESS' : 'PENDING',
  }));
};

const orders: Order[] = [
  {
    id: nanoid(),
    code: 'PED-2401',
    clientId: clientA.id,
    status: 'EN_CURSO',
    amount: 7200,
    orderDate: format(subDays(today, 20)),
    promisedDate: format(subDays(today, 2)),
    estimatedShipDate: format(addDays(today, 1)),
  },
  {
    id: nanoid(),
    code: 'PED-2402',
    clientId: clientB.id,
    status: 'PLANIFICACION',
    amount: 4800,
    orderDate: format(subDays(today, 8)),
    promisedDate: format(addDays(today, 2)),
    estimatedShipDate: format(addDays(today, 4)),
  },
  {
    id: nanoid(),
    code: 'PED-2403',
    clientId: clientA.id,
    status: 'EN_CURSO',
    amount: 2600,
    orderDate: format(subDays(today, 5)),
    promisedDate: format(addDays(today, 6)),
    estimatedShipDate: format(addDays(today, 5)),
  },
  {
    id: nanoid(),
    code: 'PED-2404',
    clientId: clientB.id,
    status: 'TERMINADO',
    amount: 1800,
    orderDate: format(subDays(today, 15)),
    promisedDate: format(subDays(today, 5)),
    actualShipDate: format(subDays(today, 1)),
  },
];

const orderItems: OrderItem[] = [
  {
    id: nanoid(),
    orderId: orders[0].id,
    productId: productBolero.id,
    productSku: productBolero.sku,
    productName: productBolero.name,
    qty: 3,
    unitPrice: 2400,
    lineTotal: 7200,
  },
  {
    id: nanoid(),
    orderId: orders[1].id,
    productId: productVestido.id,
    productSku: productVestido.sku,
    productName: productVestido.name,
    qty: 2,
    unitPrice: 2400,
    lineTotal: 4800,
  },
  {
    id: nanoid(),
    orderId: orders[2].id,
    productId: productBolero.id,
    productSku: productBolero.sku,
    productName: productBolero.name,
    qty: 1,
    unitPrice: 2600,
    lineTotal: 2600,
  },
  {
    id: nanoid(),
    orderId: orders[3].id,
    productId: productVestido.id,
    productSku: productVestido.sku,
    productName: productVestido.name,
    qty: 1,
    unitPrice: 1800,
    lineTotal: 1800,
  },
];

const orderStages: OrderStage[] = orders.flatMap((order, idx) => {
  const stages = baseStages(order.id);
  if (idx === 0) {
    stages[0].status = 'DONE';
    stages[0].startPlanned = format(subDays(today, 18));
    stages[0].endActual = format(subDays(today, 15));
    stages[1].status = 'IN_PROGRESS';
  }
  if (idx === 1) {
    stages[0].status = 'IN_PROGRESS';
  }
  if (idx === 2) {
    stages[0].status = 'DONE';
    stages[1].status = 'DONE';
    stages[2].status = 'IN_PROGRESS';
  }
  if (idx === 3) {
    stages.forEach((stage) => (stage.status = 'DONE'));
    stages[6].endActual = format(subDays(today, 1));
  }
  return stages;
});

const operators: Operator[] = [
  {
    id: nanoid(),
    name: 'María Torres',
    puesto: 'Costurera Sr.',
    hourRate: 95,
    shift: 'Matutino',
    active: true,
  },
  {
    id: nanoid(),
    name: 'Luisa Gómez',
    puesto: 'Cortadora',
    hourRate: 85,
    shift: 'Vespertino',
    active: true,
  },
];

const attendance: Attendance[] = [
  {
    id: nanoid(),
    operatorId: operators[0].id,
    operatorName: operators[0].name,
    type: 'IN',
    at: format(subDays(today, 1)),
    note: 'Inicio de turno',
  },
  {
    id: nanoid(),
    operatorId: operators[0].id,
    operatorName: operators[0].name,
    type: 'OUT',
    at: format(subDays(today, 1)),
  },
];

const invoice: Invoice = {
  id: nanoid(),
  invoiceNo: 'FAC-001',
  type: 'Cliente',
  partnerId: clientA.id,
  partnerName: clientA.name,
  date: format(subDays(today, 3)),
  amount: 7200,
  status: 'Emitida',
  orderId: orders[0].id,
};

const invoices: Invoice[] = [invoice];

const movements: Movement[] = [
  {
    id: nanoid(),
    type: 'OUT',
    materialId: materials[0].id,
    qty: 5,
    ref: 'PED-2401',
    at: format(subDays(today, 2)),
    note: 'Consumo corte',
  },
];

const settings: Settings = {
  alerts: {
    orderDays: 3,
  },
  locale: {
    currency: 'MXN',
  },
  printing: {
    header: true,
    logoUrl: '',
  },
};

const users: User[] = [
  {
    id: nanoid(),
    email: 'admin@anmac.local',
    password: 'admin123',
    name: 'Coordinación ANMAC',
    role: 'admin',
  },
  {
    id: nanoid(),
    email: 'oper@anmac.local',
    password: 'oper123',
    name: 'Operaciones',
    role: 'operator',
  },
];

export const seeds = {
  customers: [clientA, clientB],
  suppliers: [supplierA, supplierB],
  materials,
  products,
  orders,
  orderItems,
  orderStages,
  operators,
  attendance,
  invoices,
  movements,
  settings,
  users,
};
