import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import { parseISO } from 'date-fns';
import { z } from 'zod';
import {
  attendanceSchema,
  customerSchema,
  exportSchema,
  idParam,
  invoiceSchema,
  loginSchema,
  materialSchema,
  movementSchema,
  operatorSchema,
  orderItemSchema,
  orderSchema,
  orderStageSchema,
  productSchema,
  settingsSchema,
  supplierSchema,
} from './validators';
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
  Supplier,
} from './types';
import {
  create,
  getById,
  getSettings,
  list,
  remove,
  update,
  updateSettings,
} from './data/store';
import { computeMaterialStatus, computeSlackDays, computeTrafficStatus } from './utils';

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const PORT = process.env.PORT || 4000;

const attachOrderComputed = (order: Order) => {
  const settings = getSettings();
  const slackDays = computeSlackDays(order);
  const traffic = computeTrafficStatus(order, settings);
  const stages = list('orderStages').filter((stage) => stage.orderId === order.id);
  const completedStages = stages.filter((stage) => stage.status === 'DONE').length;
  const progress = stages.length ? Math.round((completedStages / stages.length) * 100) : 0;
  return {
    ...order,
    slackDays,
    traffic,
    stages,
    progress,
  };
};

const attachMaterialComputed = (material: Material) => ({
  ...material,
  statusStock: computeMaterialStatus(material),
});

const withErrorHandling = <T extends express.RequestHandler>(handler: T): express.RequestHandler => {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error inesperado en el servidor' });
    }
  };
};

app.post(
  '/api/login',
  withErrorHandling((req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Credenciales inválidas' });
    }
    const { email, password } = parsed.data;
    const user = list('users').find((u) => u.email === email && u.password === password);
    if (!user) {
      return res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
    }
    const { password: _password, ...rest } = user;
    return res.json(rest);
  })
);

app.get(
  '/api/orders',
  withErrorHandling((req, res) => {
    const orders = list('orders').map(attachOrderComputed);
    const items = list('orderItems');
    const clients = list('customers');
    const enriched = orders.map((order) => ({
      ...order,
      client: clients.find((c) => c.id === order.clientId) || null,
      items: items.filter((item) => item.orderId === order.id),
    }));
    res.json(enriched);
  })
);

app.get(
  '/api/orders/:id',
  withErrorHandling((req, res) => {
    const params = idParam.safeParse(req.params);
    if (!params.success) {
      return res.status(400).json({ message: 'ID inválido' });
    }
    const order = getById('orders', params.data.id);
    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }
    const items = list('orderItems').filter((item) => item.orderId === order.id);
    const stages = list('orderStages').filter((stage) => stage.orderId === order.id);
    res.json({
      ...attachOrderComputed(order),
      items,
      stages,
    });
  })
);

app.post(
  '/api/orders',
  withErrorHandling((req, res) => {
    const parsed = orderSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Datos de pedido inválidos' });
    }
    const created = create('orders', parsed.data);
    res.status(201).json(attachOrderComputed(created));
  })
);

app.put(
  '/api/orders/:id',
  withErrorHandling((req, res) => {
    const params = idParam.safeParse(req.params);
    if (!params.success) {
      return res.status(400).json({ message: 'ID inválido' });
    }
    const parsed = orderSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Datos de pedido inválidos' });
    }
    const updatedOrder = update('orders', params.data.id, parsed.data);
    if (!updatedOrder) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }
    res.json(attachOrderComputed(updatedOrder));
  })
);

app.delete(
  '/api/orders/:id',
  withErrorHandling((req, res) => {
    const params = idParam.safeParse(req.params);
    if (!params.success) {
      return res.status(400).json({ message: 'ID inválido' });
    }
    const deleted = remove('orders', params.data.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }
    res.status(204).send();
  })
);

const registerCrud = (
  path: string,
  schema: z.ZodTypeAny,
  collection: keyof typeof collectionKeys,
  mapper?: (item: any) => any
) => {
  const partialSchema = 'partial' in schema ? (schema as any).partial() : schema;
  app.get(
    `/api/${path}`,
    withErrorHandling((req, res) => {
      const items = list(collection as any).map((item: any) => (mapper ? mapper(item) : item));
      res.json(items);
    })
  );

  app.post(
    `/api/${path}`,
    withErrorHandling((req, res) => {
      const parsed = schema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: 'Datos inválidos' });
      }
      const created = create(collection as any, parsed.data as any);
      res.status(201).json(mapper ? mapper(created) : created);
    })
  );

  app.put(
    `/api/${path}/:id`,
    withErrorHandling((req, res) => {
      const params = idParam.safeParse(req.params);
      if (!params.success) {
        return res.status(400).json({ message: 'ID inválido' });
      }
      const parsed = partialSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ message: 'Datos inválidos' });
      }
      const updatedItem = update(collection as any, params.data.id, parsed.data as any);
      if (!updatedItem) {
        return res.status(404).json({ message: 'Registro no encontrado' });
      }
      res.json(mapper ? mapper(updatedItem) : updatedItem);
    })
  );

  app.delete(
    `/api/${path}/:id`,
    withErrorHandling((req, res) => {
      const params = idParam.safeParse(req.params);
      if (!params.success) {
        return res.status(400).json({ message: 'ID inválido' });
      }
      const deleted = remove(collection as any, params.data.id);
      if (!deleted) {
        return res.status(404).json({ message: 'Registro no encontrado' });
      }
      res.status(204).send();
    })
  );
};

const collectionKeys = {
  customers: true,
  suppliers: true,
  materials: true,
  products: true,
  orderItems: true,
  orderStages: true,
  operators: true,
  attendance: true,
  invoices: true,
  movements: true,
};

registerCrud('clientes', customerSchema, 'customers');
registerCrud('proveedores', supplierSchema, 'suppliers');
registerCrud('inventario', materialSchema, 'materials', attachMaterialComputed);
registerCrud('productos', productSchema, 'products');
registerCrud('orderItems', orderItemSchema, 'orderItems');
registerCrud('orderStages', orderStageSchema, 'orderStages');
registerCrud('operarias', operatorSchema, 'operators');
registerCrud('asistencia', attendanceSchema, 'attendance');
registerCrud('facturas', invoiceSchema, 'invoices');
registerCrud('movimientos', movementSchema, 'movements');

app.post(
  '/api/movimientos/:id/aplicar',
  withErrorHandling((req, res) => {
    const params = idParam.safeParse(req.params);
    if (!params.success) {
      return res.status(400).json({ message: 'ID inválido' });
    }
    const movement = getById('movements', params.data.id);
    if (!movement) {
      return res.status(404).json({ message: 'Movimiento no encontrado' });
    }
    const material = getById('materials', movement.materialId);
    if (!material) {
      return res.status(404).json({ message: 'Material no encontrado' });
    }
    let newAvailable = material.available;
    let newOnHand = material.onHand;
    if (movement.type === 'IN') {
      newOnHand += movement.qty;
      newAvailable += movement.qty;
    }
    if (movement.type === 'OUT') {
      if (movement.qty > material.available) {
        return res.status(400).json({ message: 'No hay suficiente inventario disponible' });
      }
      newOnHand -= movement.qty;
      newAvailable -= movement.qty;
    }
    if (movement.type === 'ADJUST') {
      newOnHand += movement.qty;
      newAvailable += movement.qty;
    }
    const updated = update('materials', material.id, {
      onHand: newOnHand,
      available: newAvailable,
    });
    res.json(attachMaterialComputed(updated!));
  })
);

app.get(
  '/api/dashboard',
  withErrorHandling((req, res) => {
    const orders = list('orders').map(attachOrderComputed);
    const total = orders.length;
    const finished = orders.filter((order) => order.status === 'TERMINADO').length;
    const inProgress = orders.filter((order) => order.status === 'EN_CURSO').length;
    const revenue = orders.reduce((acc, order) => acc + order.amount, 0);
    const traffic = orders.reduce(
      (acc, order) => {
        acc[order.traffic] += 1;
        return acc;
      },
      { GREEN: 0, AMBER: 0, RED: 0 }
    );
    const recent = orders
      .sort((a, b) => parseISO(b.orderDate).getTime() - parseISO(a.orderDate).getTime())
      .slice(0, 5)
      .map((order) => ({
        ...order,
        client: list('customers').find((c) => c.id === order.clientId) || null,
      }));
    res.json({ total, finished, inProgress, revenue, traffic, recent });
  })
);

app.get(
  '/api/settings',
  withErrorHandling((req, res) => {
    res.json(getSettings());
  })
);

app.put(
  '/api/settings',
  withErrorHandling((req, res) => {
    const parsed = settingsSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Configuración inválida' });
    }
    const updated = updateSettings(parsed.data);
    res.json(updated);
  })
);

app.post(
  '/api/export/sheets',
  withErrorHandling((req, res) => {
    const parsed = exportSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Solicitud inválida' });
    }
    res.json({ message: `Exportación a Google Sheets simulada (${parsed.data.sheetName})` });
  })
);

app.use((req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
  console.log(`ANMAC Taller OS API escuchando en http://localhost:${PORT}`);
});
