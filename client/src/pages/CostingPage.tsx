import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import PageShell from '../components/PageShell';
import ActionBar from '../components/ActionBar';
import EmptyState from '../components/EmptyState';
import StatusChip from '../components/StatusChip';
import { useApi } from '../context/ApiContext';
import { useSettings } from '../context/SettingsContext';
import { Product } from '../types';
import { formatCurrency } from '../utils/formatters';

const CostingPage = () => {
  const api = useApi();
  const { settings } = useSettings();
  const currency = settings?.locale.currency ?? 'MXN';
  const { data, isLoading } = useQuery<Product[]>({ queryKey: ['products'], queryFn: api.getProducts });

  const totals = useMemo(() => {
    if (!data || data.length === 0) return { count: 0, avgMargin: 0, profitability: 'Baja' };
    const margins = data
      .filter((product) => product.price)
      .map((product) => {
        const materials = product.bom?.reduce((acc, item) => acc + item.cost, 0) ?? 0;
        const labor = product.laborCost ?? 0;
        const overhead = product.overheadCost ?? 0;
        const totalCost = materials + labor + overhead;
        return product.price ? ((product.price - totalCost) / product.price) * 100 : 0;
      });
    const avgMargin = margins.reduce((acc, value) => acc + value, 0) / (margins.length || 1);
    const profitability = avgMargin >= 50 ? 'Alta' : avgMargin >= 30 ? 'Media' : 'Baja';
    return { count: data.length, avgMargin, profitability };
  }, [data]);

  return (
    <PageShell
      title="Costeo y margen"
      description="Composición de costos por producto: materiales, mano de obra e indirectos."
      actions={<ActionBar onPrint={() => window.print()} onExport={() => api.exportToSheets('Costeo (Resumen)', data ?? [])} />}
    >
      {isLoading ? (
        <EmptyState title="Cargando costeo" description="Sincronizando información financiera." />
      ) : !data || data.length === 0 ? (
        <EmptyState title="No hay productos" description="Agrega productos para analizar sus márgenes." />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-3">
            <Kpi label="Productos analizados" value={totals.count.toString()} />
            <Kpi label="Margen promedio" value={`${totals.avgMargin.toFixed(1)} %`} />
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
              <p className="text-sm text-slate-400">Rentabilidad</p>
              <div className="mt-3 flex items-center gap-3">
                <StatusChip
                  label={totals.profitability}
                  variant={totals.profitability === 'Alta' ? 'success' : totals.profitability === 'Media' ? 'warning' : 'danger'}
                />
              </div>
            </div>
          </div>
          <div className="grid gap-6">
            {data.map((product) => (
              <article key={product.id} className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                    <p className="text-xs uppercase tracking-wide text-slate-400">{product.sku}</p>
                  </div>
                  <StatusChip label={product.category} />
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <CostBlock title="Materiales" amount={formatCurrency(product.bom?.reduce((acc, item) => acc + item.cost, 0) ?? 0, currency)} />
                  <CostBlock title="Mano de obra" amount={formatCurrency(product.laborCost ?? 0, currency)} />
                  <CostBlock title="Indirectos" amount={formatCurrency(product.overheadCost ?? 0, currency)} />
                </div>
                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <CostBlock title="Costo total" amount={formatCurrency(calcTotal(product), currency)} highlight />
                  <CostBlock title="Precio" amount={product.price ? formatCurrency(product.price, currency) : '—'} />
                  <CostBlock title="Margen" amount={`${calcMargin(product).toFixed(1)} %`} trend={calcMargin(product)} />
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </PageShell>
  );
};

const calcTotal = (product: Product) => {
  const materials = product.bom?.reduce((acc, item) => acc + item.cost, 0) ?? 0;
  const labor = product.laborCost ?? 0;
  const overhead = product.overheadCost ?? 0;
  return materials + labor + overhead;
};

const calcMargin = (product: Product) => {
  if (!product.price) return 0;
  const total = calcTotal(product);
  return ((product.price - total) / product.price) * 100;
};

const Kpi = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
    <p className="text-sm text-slate-400">{label}</p>
    <p className="mt-2 text-3xl font-bold text-white">{value}</p>
  </div>
);

const CostBlock = ({ title, amount, highlight, trend }: { title: string; amount: string; highlight?: boolean; trend?: number }) => (
  <div
    className={`rounded-2xl border p-4 ${
      highlight ? 'border-indigo-500/40 bg-indigo-500/10 text-white' : 'border-slate-800 bg-slate-950/50 text-slate-200'
    }`}
  >
    <p className="text-xs uppercase tracking-wide text-slate-400">{title}</p>
    <p className="mt-2 text-lg font-semibold">{amount}</p>
    {trend !== undefined && (
      <p className={`text-xs ${trend >= 50 ? 'text-emerald-300' : trend >= 30 ? 'text-amber-300' : 'text-rose-300'}`}>
        Salud {trend >= 50 ? 'óptima' : trend >= 30 ? 'en alerta' : 'crítica'}
      </p>
    )}
  </div>
);

export default CostingPage;
