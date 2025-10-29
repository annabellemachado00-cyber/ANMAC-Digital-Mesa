import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { RadioGroup } from '@headlessui/react';
import { CalendarDaysIcon } from '@heroicons/react/24/outline';
import PageShell from '../components/PageShell';
import ActionBar from '../components/ActionBar';
import TrafficLight from '../components/TrafficLight';
import StatusChip from '../components/StatusChip';
import ProgressRing from '../components/ProgressRing';
import EmptyState from '../components/EmptyState';
import { useApi } from '../context/ApiContext';
import { useSettings } from '../context/SettingsContext';
import { Order, OrderStage, TrafficStatus } from '../types';
import { clamp, formatCurrency, formatDate } from '../utils/formatters';
import clsx from 'clsx';

const viewModes = [
  { id: 'tabla', label: 'Tabla' },
  { id: 'kanban', label: 'Kanban' },
  { id: 'timeline', label: 'Timeline' },
] as const;

type ViewMode = (typeof viewModes)[number]['id'];

const statusFilters: { id: string; label: string; match: (order: Order) => boolean }[] = [
  { id: 'todos', label: 'Todos', match: () => true },
  { id: 'verdes', label: 'Verdes', match: (order) => order.traffic === 'GREEN' },
  { id: 'ambar', label: 'Ámbar', match: (order) => order.traffic === 'AMBER' },
  { id: 'rojos', label: 'Rojos', match: (order) => order.traffic === 'RED' },
  { id: 'semana', label: 'Esta semana', match: (order) => {
    const promised = new Date(order.promisedDate);
    const now = new Date();
    const diff = (promised.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  } },
];

const OrdersPage = () => {
  const api = useApi();
  const { settings } = useSettings();
  const currency = settings?.locale.currency ?? 'MXN';
  const { data, isLoading } = useQuery<Order[]>({ queryKey: ['orders'], queryFn: api.getOrders });
  const [view, setView] = useState<ViewMode>('tabla');
  const [activeFilter, setActiveFilter] = useState(statusFilters[0].id);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const filteredOrders = useMemo(() => {
    if (!data) return [];
    const filter = statusFilters.find((item) => item.id === activeFilter);
    return data.filter((order) => (filter ? filter.match(order) : true));
  }, [activeFilter, data]);

  const legend =
    'Cada pedido muestra el semáforo de fechas, Slack en días y el porcentaje de avance calculado por etapas. El timeline refleja la distancia entre fecha de orden y prometida con marcador HOY.';

  const openDrawer = (order: Order) => setSelectedOrder(order);
  const closeDrawer = () => setSelectedOrder(null);

  return (
    <PageShell
      title="Gestión de pedidos"
      description="Control total del pipeline de producción con tabla, tablero Kanban y timeline visual."
      legend={legend}
      actions={<ActionBar onAdd={() => undefined} onPrint={() => window.print()} onExport={() => api.exportToSheets('Pedidos (Lista)', filteredOrders)} />}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <RadioGroup value={view} onChange={setView} className="flex gap-3">
          {viewModes.map((mode) => (
            <RadioGroup.Option key={mode.id} value={mode.id}>
              {({ checked }) => (
                <span
                  className={clsx(
                    'flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition',
                    checked ? 'border-indigo-400 bg-indigo-500/20 text-white' : 'border-slate-700 bg-slate-900/70 text-slate-400'
                  )}
                >
                  {mode.label}
                </span>
              )}
            </RadioGroup.Option>
          ))}
        </RadioGroup>
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={clsx(
                'rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-wide transition',
                activeFilter === filter.id
                  ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/30'
                  : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800/60 hover:text-white'
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
      {isLoading ? (
        <EmptyState title="Cargando pedidos" description="Obteniendo datos en vivo desde la API." />
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          title="No hay pedidos"
          description="No encontramos pedidos con el filtro aplicado."
          actionLabel="Limpiar filtros"
          onAction={() => setActiveFilter('todos')}
        />
      ) : (
        <div className="space-y-8">
          {view === 'tabla' && <OrdersTable orders={filteredOrders} onSelect={openDrawer} currency={currency} />}
          {view === 'kanban' && <OrdersKanban orders={filteredOrders} onSelect={openDrawer} currency={currency} />}
          {view === 'timeline' && <OrdersTimeline orders={filteredOrders} />}
        </div>
      )}
      {selectedOrder && <OrderDrawer orderId={selectedOrder.id} onClose={closeDrawer} currency={currency} />}
    </PageShell>
  );
};

const OrdersTable = ({ orders, onSelect, currency }: { orders: Order[]; onSelect: (order: Order) => void; currency: string }) => (
  <div className="overflow-hidden rounded-3xl border border-slate-800">
    <table className="min-w-full divide-y divide-slate-800/80 text-sm">
      <thead className="bg-slate-900/80 text-xs uppercase tracking-wide text-slate-400">
        <tr>
          <th className="px-4 py-3 text-left">●</th>
          <th className="px-4 py-3 text-left">Código</th>
          <th className="px-4 py-3 text-left">Cliente</th>
          <th className="px-4 py-3 text-left">Orden</th>
          <th className="px-4 py-3 text-left">Prometida</th>
          <th className="px-4 py-3 text-left">ETA</th>
          <th className="px-4 py-3 text-left">Slack</th>
          <th className="px-4 py-3 text-left">Monto</th>
          <th className="px-4 py-3 text-left">Etapas</th>
          <th className="px-4 py-3 text-left">Progreso</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-800/50">
        {orders.map((order) => (
          <tr
            key={order.id}
            className="cursor-pointer bg-slate-950/50 hover:bg-slate-900/80"
            onClick={() => onSelect(order)}
          >
            <td className="px-4 py-4">
              <TrafficLight status={order.traffic} />
            </td>
            <td className="px-4 py-4 font-semibold text-white">{order.code}</td>
            <td className="px-4 py-4 text-slate-300">{order.client?.name}</td>
            <td className="px-4 py-4 text-slate-300">{formatDate(order.orderDate)}</td>
            <td className="px-4 py-4 text-slate-300">{formatDate(order.promisedDate)}</td>
            <td className="px-4 py-4 text-slate-300">{order.estimatedShipDate ? formatDate(order.estimatedShipDate) : '—'}</td>
            <td className="px-4 py-4 text-slate-200">{order.slackDays} d</td>
            <td className="px-4 py-4 text-slate-200">{formatCurrency(order.amount, currency)}</td>
            <td className="px-4 py-4">
              <div className="flex flex-wrap gap-2">
                {order.stages.map((stage) => (
                  <StatusChip
                    key={stage.id}
                    label={stage.stage}
                    variant={stage.status === 'DONE' ? 'success' : stage.status === 'IN_PROGRESS' ? 'warning' : 'default'}
                  />
                ))}
              </div>
            </td>
            <td className="px-4 py-4">
              <ProgressRing value={clamp(order.progress)} size={64} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const isInQuality = (order: Order) =>
  order.stages.some((stage) => stage.stage === 'Calidad' && stage.status === 'IN_PROGRESS');

const kanbanColumns: { id: string; title: string; match: (order: Order) => boolean }[] = [
  { id: 'plan', title: 'Planificación', match: (order) => order.status === 'PLANIFICACION' },
  { id: 'progress', title: 'En curso', match: (order) => order.status === 'EN_CURSO' && !isInQuality(order) },
  { id: 'quality', title: 'Calidad', match: (order) => order.status === 'EN_CURSO' && isInQuality(order) },
  { id: 'done', title: 'Completado', match: (order) => order.status === 'TERMINADO' },
  { id: 'cancel', title: 'Cancelado', match: (order) => order.status === 'CANCELADO' },
];

const OrdersKanban = ({ orders, onSelect, currency }: { orders: Order[]; onSelect: (order: Order) => void; currency: string }) => (
  <div className="grid gap-4 lg:grid-cols-3 xl:grid-cols-5">
    {kanbanColumns.map((column) => (
      <div key={column.id} className="rounded-3xl border border-slate-800 bg-slate-900/60 p-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-200">{column.title}</h4>
          <span className="text-xs text-slate-500">{orders.filter((order) => column.match(order)).length}</span>
        </div>
        <div className="mt-4 space-y-3">
          {orders
            .filter((order) => column.match(order))
            .map((order) => (
              <div
                key={order.id}
                onClick={() => onSelect(order)}
                className="space-y-2 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 shadow-lg shadow-indigo-500/10 transition hover:border-indigo-400"
              >
                <div className="flex items-center justify-between">
                  <TrafficLight status={order.traffic} />
                  <span className="text-xs text-slate-400">Slack {order.slackDays} d</span>
                </div>
                <p className="text-sm font-semibold text-white">{order.code}</p>
                <p className="text-xs text-slate-400">{order.client?.name}</p>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Prometida {formatDate(order.promisedDate)}</span>
                  <span>{order.progress}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-indigo-500"
                    style={{ width: `${clamp(order.progress)}%` }}
                  />
                </div>
                <p className="text-xs text-slate-500">Monto {formatCurrency(order.amount, currency)}</p>
              </div>
            ))}
        </div>
      </div>
    ))}
  </div>
);

const OrdersTimeline = ({ orders }: { orders: Order[] }) => (
  <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
    <div className="flex items-center gap-3 text-xs uppercase tracking-wide text-slate-400">
      <CalendarDaysIcon className="h-5 w-5" />
      <span>Línea de tiempo de pedidos</span>
    </div>
    <div className="relative mt-8 space-y-6">
      <div className="absolute left-0 top-0 h-full border-l border-dashed border-slate-700" />
      {orders.map((order) => (
        <div key={order.id} className="relative pl-8">
          <div className="absolute left-0 top-1.5 h-3 w-3 -translate-x-1/2 rounded-full border border-slate-800 bg-slate-950" />
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <TrafficLight status={order.traffic} />
                <div>
                  <p className="font-semibold text-white">{order.code}</p>
                  <p className="text-xs text-slate-400">{order.client?.name}</p>
                </div>
              </div>
              <StatusChip
                label={`Slack ${order.slackDays} d`}
                variant={order.traffic === 'RED' ? 'danger' : order.traffic === 'AMBER' ? 'warning' : 'success'}
              />
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <TimelineBar order={order} />
              <div className="space-y-2">
                {order.stages.map((stage) => (
                  <div key={stage.id} className="flex items-center justify-between text-xs text-slate-300">
                    <span>{stage.stage}</span>
                    <StatusChip
                      label={stage.status === 'DONE' ? 'Hecho' : stage.status === 'IN_PROGRESS' ? 'En progreso' : 'Pendiente'}
                      variant={stage.status === 'DONE' ? 'success' : stage.status === 'IN_PROGRESS' ? 'warning' : 'default'}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const TimelineBar = ({ order }: { order: Order }) => {
  const start = new Date(order.orderDate).getTime();
  const end = new Date(order.promisedDate).getTime();
  const today = Date.now();
  const total = end - start;
  const progress = clamp(((today - start) / total) * 100, 0, 100);

  return (
    <div className="relative">
      <div className="flex justify-between text-xs text-slate-400">
        <span>Orden {formatDate(order.orderDate)}</span>
        <span>Prometida {formatDate(order.promisedDate)}</span>
      </div>
      <div className="mt-3 h-3 rounded-full bg-slate-800">
        <div
          className={clsx('h-full rounded-full', {
            'bg-verde': order.traffic === 'GREEN',
            'bg-ambar': order.traffic === 'AMBER',
            'bg-rojo': order.traffic === 'RED',
          })}
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="absolute top-1/2 flex -translate-y-1/2 items-center" style={{ left: `${progress}%` }}>
        <span className="translate-x-[-50%] rounded-full bg-indigo-500 px-2 py-0.5 text-[10px] font-semibold text-white">
          HOY
        </span>
      </div>
    </div>
  );
};

const OrderDrawer = ({ orderId, onClose, currency }: { orderId: string; onClose: () => void; currency: string }) => {
  const api = useApi();
  const { data: order } = useQuery<Order>({
    queryKey: ['orders', orderId],
    queryFn: () => api.getOrder(orderId),
  });

  if (!order) return null;

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-slate-950/70 backdrop-blur-sm">
      <div className="h-full w-full max-w-xl overflow-y-auto border-l border-slate-800 bg-slate-950/90 p-8">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-semibold text-white">{order.code}</h3>
              <TrafficLight status={order.traffic} />
            </div>
            <p className="mt-2 text-xs uppercase tracking-wide text-slate-400">{order.status}</p>
          </div>
          <button onClick={onClose} className="text-sm text-slate-400 hover:text-white">
            Cerrar
          </button>
        </div>
        <div className="mt-6 grid gap-4 text-sm text-slate-300">
          <div className="grid grid-cols-2 gap-3">
            <InfoBlock label="Fecha orden" value={formatDate(order.orderDate)} />
            <InfoBlock label="Prometida" value={formatDate(order.promisedDate)} />
            <InfoBlock label="ETA" value={order.estimatedShipDate ? formatDate(order.estimatedShipDate) : '—'} />
            <InfoBlock label="Real" value={order.actualShipDate ? formatDate(order.actualShipDate) : '—'} />
          </div>
          <InfoBlock label="Monto" value={formatCurrency(order.amount, currency)} />
          <InfoBlock label="Slack" value={`${order.slackDays} días`} />
          <div className="mt-4 flex items-center gap-4">
            <ProgressRing value={clamp(order.progress)} />
            <div className="text-xs text-slate-400">
              <p>
                {order.stages.filter((stage) => stage.status === 'DONE').length} de {order.stages.length} etapas completadas
              </p>
              <p>Actualiza el estado para recalcular el progreso automáticamente.</p>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Etapas</h4>
            <div className="mt-3 flex flex-wrap gap-2">
              {order.stages.map((stage) => (
                <StatusChip
                  key={stage.id}
                  label={`${stage.stage} · ${mapStage(stage)}`}
                  variant={stage.status === 'DONE' ? 'success' : stage.status === 'IN_PROGRESS' ? 'warning' : 'default'}
                />
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Ítems</h4>
            <div className="mt-3 space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3 text-xs">
                  <div className="flex items-center justify-between text-slate-200">
                    <span className="font-semibold">{item.productName}</span>
                    <span>{formatCurrency(item.lineTotal, currency)}</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-slate-400">
                    <span>{item.productSku}</span>
                    <span>
                      {item.qty} uds x {formatCurrency(item.unitPrice, currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button className="rounded-full bg-indigo-500 px-5 py-2 text-sm font-semibold text-white">Editar</button>
            <button className="rounded-full border border-slate-700 px-5 py-2 text-sm font-semibold text-white">Guardar</button>
            <button className="rounded-full border border-slate-700 px-5 py-2 text-sm font-semibold text-white">Cancelar</button>
            <button className="rounded-full border border-slate-700 px-5 py-2 text-sm font-semibold text-white">Imprimir</button>
            <button className="rounded-full border border-slate-700 px-5 py-2 text-sm font-semibold text-white">Exportar</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const mapStage = (stage: OrderStage) => {
  if (stage.status === 'DONE') return 'Completada';
  if (stage.status === 'IN_PROGRESS') return 'En curso';
  if (stage.status === 'BLOCKED') return 'Bloqueada';
  return 'Pendiente';
};

const InfoBlock = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
    <p className="text-sm font-semibold text-white">{value}</p>
  </div>
);

export default OrdersPage;
