import { useQuery } from '@tanstack/react-query';
import { CurrencyDollarIcon } from '@heroicons/react/24/outline';
import PageShell from '../components/PageShell';
import TrafficLight from '../components/TrafficLight';
import StatusChip from '../components/StatusChip';
import EmptyState from '../components/EmptyState';
import { useApi } from '../context/ApiContext';
import { useSettings } from '../context/SettingsContext';
import { DashboardSummary, TrafficStatus } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

const PanelPage = () => {
  const api = useApi();
  const { settings } = useSettings();
  const currency = settings?.locale.currency ?? 'MXN';
  const { data, isLoading } = useQuery<DashboardSummary>({ queryKey: ['dashboard'], queryFn: api.getDashboard });

  const legendText =
    'El semáforo indica riesgo de cumplimiento por fechas prometidas. Rojo: vencido, Ámbar: alerta por días configurados, Verde: dentro del plan. Slack indica días de holgura contra la fecha prometida.';

  return (
    <PageShell
      title="Panel de control"
      description="Visibilidad global de la producción, pedidos recientes y salud operativa."
      legend={legendText}
    >
      {isLoading || !data ? (
        <EmptyState title="Cargando información" description="Estamos consultando los indicadores en la API." />
      ) : (
        <div className="space-y-8">
          <div className="grid gap-6 md:grid-cols-4">
            <KpiCard title="Total pedidos" value={data.total.toString()} />
            <KpiCard title="Terminados" value={data.finished.toString()} />
            <KpiCard title="En curso" value={data.inProgress.toString()} />
            <KpiCard title="Ingresos" value={formatCurrency(data.revenue, currency)} icon />
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {(['GREEN', 'AMBER', 'RED'] as TrafficStatus[]).map((status) => (
              <div key={status} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
                <div className="flex items-center justify-between">
                  <TrafficLight status={status} />
                  <span className="text-4xl font-bold text-white">{data.traffic[status]}</span>
                </div>
                <p className="mt-2 text-sm text-slate-400">
                  {status === 'GREEN' && 'Pedidos sin riesgo inmediato'}
                  {status === 'AMBER' && 'Pedidos dentro del umbral de alerta'}
                  {status === 'RED' && 'Pedidos con promesa vencida'}
                </p>
              </div>
            ))}
          </div>
          <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Pedidos recientes</h3>
              <span className="text-xs uppercase tracking-wide text-slate-400">Últimas actualizaciones</span>
            </div>
            <div className="mt-4 space-y-4">
              {data.recent.length === 0 ? (
                <EmptyState
                  title="No hay pedidos registrados"
                  description="Comienza registrando un nuevo pedido para visualizar el flujo de producción."
                  actionLabel="Agregar pedido"
                />
              ) : (
                data.recent.map((order) => (
                  <div
                    key={order.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-950/60 px-5 py-4"
                  >
                    <div className="flex items-center gap-4">
                      <TrafficLight status={order.traffic} />
                      <div>
                        <p className="font-semibold text-white">{order.code}</p>
                        <p className="text-xs text-slate-400">{order.client?.name}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-12 gap-y-1 text-xs text-slate-300 md:grid-cols-4">
                      <div>
                        <span className="text-slate-500">Prometida</span>
                        <p className="font-semibold text-white">{formatDate(order.promisedDate)}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">ETA</span>
                        <p className="font-semibold text-white">{order.estimatedShipDate ? formatDate(order.estimatedShipDate) : '—'}</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Slack</span>
                        <p className="font-semibold text-white">{order.slackDays} d</p>
                      </div>
                      <div>
                        <span className="text-slate-500">Monto</span>
                        <p className="font-semibold text-white">{formatCurrency(order.amount, currency)}</p>
                      </div>
                    </div>
                    <StatusChip
                      label={order.status.replace('_', ' ')}
                      variant={order.status === 'TERMINADO' ? 'success' : order.status === 'CANCELADO' ? 'danger' : 'default'}
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </PageShell>
  );
};

interface KpiCardProps {
  title: string;
  value: string;
  icon?: boolean;
}

const KpiCard = ({ title, value, icon }: KpiCardProps) => (
  <div className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg shadow-indigo-500/5">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-400">{title}</p>
        <p className="mt-2 text-3xl font-bold text-white">{value}</p>
      </div>
      {icon && <CurrencyDollarIcon className="h-10 w-10 text-emerald-400" />}
    </div>
  </div>
);

export default PanelPage;
