import { useMemo, useState } from 'react';
import PageShell from '../components/PageShell';
import ActionBar from '../components/ActionBar';
import { formatCurrency } from '../utils/formatters';
import { useApi } from '../context/ApiContext';
import { useSettings } from '../context/SettingsContext';

const BreakevenPage = () => {
  const api = useApi();
  const { settings } = useSettings();
  const currency = settings?.locale.currency ?? 'MXN';
  const [inputs, setInputs] = useState({ fixed: 150000, price: 2400, variable: 950 });

  const result = useMemo(() => {
    if (inputs.price <= inputs.variable) {
      return { units: 0, sales: 0 };
    }
    const units = Math.ceil(inputs.fixed / (inputs.price - inputs.variable));
    const sales = units * inputs.price;
    return { units, sales };
  }, [inputs]);

  const legend = 'Calcula el punto de equilibrio ajustando costos fijos, precio unitario y costo variable por prenda.';

  return (
    <PageShell
      title="Punto de equilibrio"
      description="Simulador rápido para conocer cuántas unidades necesitas vender para cubrir costos."
      legend={legend}
      actions={<ActionBar onPrint={() => window.print()} onExport={() => api.exportToSheets('Punto de equilibrio', [{ ...inputs, ...result }])} />}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
          <InputControl
            label="Costos fijos mensuales"
            value={inputs.fixed}
            onChange={(value) => setInputs((prev) => ({ ...prev, fixed: value }))}
          />
          <InputControl
            label="Precio unitario"
            value={inputs.price}
            onChange={(value) => setInputs((prev) => ({ ...prev, price: value }))}
          />
          <InputControl
            label="Costo variable unitario"
            value={inputs.variable}
            onChange={(value) => setInputs((prev) => ({ ...prev, variable: value }))}
          />
        </div>
        <div className="space-y-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
          <ResultCard title="Unidades para equilibrio" value={`${result.units} uds`} />
          <ResultCard title="Ventas necesarias" value={formatCurrency(result.sales, currency)} />
          <div className="mt-6 h-40 w-full rounded-2xl bg-gradient-to-r from-indigo-500/20 to-emerald-500/20">
            <div className="h-full w-full bg-[linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(0deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[length:20px_20px]" />
          </div>
        </div>
      </div>
    </PageShell>
  );
};

const InputControl = ({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) => (
  <div>
    <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
    <input
      className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-white focus:border-indigo-400 focus:outline-none"
      type="number"
      value={value}
      onChange={(event) => onChange(Number(event.target.value))}
    />
  </div>
);

const ResultCard = ({ title, value }: { title: string; value: string }) => (
  <div>
    <p className="text-sm text-slate-400">{title}</p>
    <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
  </div>
);

export default BreakevenPage;
