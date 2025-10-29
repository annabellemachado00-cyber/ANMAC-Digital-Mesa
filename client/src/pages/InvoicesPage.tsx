import { useQuery } from '@tanstack/react-query';
import PageShell from '../components/PageShell';
import ActionBar from '../components/ActionBar';
import EmptyState from '../components/EmptyState';
import { useApi } from '../context/ApiContext';
import { useSettings } from '../context/SettingsContext';
import { Invoice, Order } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

const InvoicesPage = () => {
  const api = useApi();
  const { settings } = useSettings();
  const currency = settings?.locale.currency ?? 'MXN';
  const { data, isLoading } = useQuery<Invoice[]>({ queryKey: ['invoices'], queryFn: api.getInvoices });
  const { data: orders } = useQuery<Order[]>({ queryKey: ['orders'], queryFn: api.getOrders });

  const resolveOrder = (orderId?: string) => orders?.find((order) => order.id === orderId)?.code ?? '—';

  return (
    <PageShell
      title="Facturas"
      description="Seguimiento de facturas de clientes y proveedores."
      actions={<ActionBar onAdd={() => undefined} onEdit={() => undefined} onPrint={() => window.print()} onExport={() => api.exportToSheets('Facturas', data ?? [])} />}
    >
      {isLoading ? (
        <EmptyState title="Cargando facturas" description="Sincronizando finanzas." />
      ) : !data || data.length === 0 ? (
        <EmptyState title="Sin facturas" description="Genera facturas para controlar tu flujo de efectivo." />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-800">
          <table className="min-w-full divide-y divide-slate-800/80 text-sm">
            <thead className="bg-slate-900/80 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3 text-left">Nº</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Relación</th>
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Importe</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-left">Pedido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {data.map((invoice) => (
                <tr key={invoice.id} className="bg-slate-950/60">
                  <td className="px-4 py-4 font-semibold text-white">{invoice.invoiceNo}</td>
                  <td className="px-4 py-4 text-slate-300">{invoice.type}</td>
                  <td className="px-4 py-4 text-slate-300">{invoice.partnerName}</td>
                  <td className="px-4 py-4 text-slate-300">{formatDate(invoice.date)}</td>
                  <td className="px-4 py-4 text-slate-300">{formatCurrency(invoice.amount, currency)}</td>
                  <td className="px-4 py-4 text-slate-300">{invoice.status}</td>
                  <td className="px-4 py-4 text-slate-300">{resolveOrder(invoice.orderId)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  );
};

export default InvoicesPage;
