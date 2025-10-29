import { useQuery } from '@tanstack/react-query';
import PageShell from '../components/PageShell';
import ActionBar from '../components/ActionBar';
import EmptyState from '../components/EmptyState';
import { useApi } from '../context/ApiContext';
import { Customer, Order } from '../types';

const CustomersPage = () => {
  const api = useApi();
  const { data, isLoading } = useQuery<Customer[]>({ queryKey: ['customers'], queryFn: api.getCustomers });
  const { data: orders } = useQuery<Order[]>({ queryKey: ['orders'], queryFn: api.getOrders });

  const getOrdersCount = (customerId: string) => orders?.filter((order) => order.clientId === customerId).length ?? 0;

  return (
    <PageShell
      title="Clientes"
      description="Directorio comercial con datos de contacto y volumen de pedidos."
      actions={<ActionBar onAdd={() => undefined} onEdit={() => undefined} onPrint={() => window.print()} onExport={() => api.exportToSheets('Clientes', data ?? [])} />}
    >
      {isLoading ? (
        <EmptyState title="Cargando clientes" description="Sincronizando CRM." />
      ) : !data || data.length === 0 ? (
        <EmptyState title="Sin clientes" description="Agrega tus clientes estratégicos." />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {data.map((customer) => (
            <div key={customer.id} className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
              <h3 className="text-lg font-semibold text-white">{customer.name}</h3>
              <div className="mt-4 space-y-2 text-sm text-slate-300">
                <p>📧 {customer.email}</p>
                <p>📞 {customer.phone}</p>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  Pedidos realizados: {getOrdersCount(customer.id)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </PageShell>
  );
};

export default CustomersPage;
