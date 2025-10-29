import { useEffect, useState } from 'react';
import PageShell from '../components/PageShell';
import ActionBar from '../components/ActionBar';
import EmptyState from '../components/EmptyState';
import { useSettings } from '../context/SettingsContext';
import { useApi } from '../context/ApiContext';

const AdminPage = () => {
  const { settings, isLoading, update } = useSettings();
  const api = useApi();
  const [form, setForm] = useState({ orderDays: 3, currency: 'MXN', header: true, logoUrl: '' });

  useEffect(() => {
    if (settings) {
      setForm({
        orderDays: settings.alerts.orderDays,
        currency: settings.locale.currency,
        header: settings.printing.header,
        logoUrl: settings.printing.logoUrl ?? '',
      });
    }
  }, [settings]);

  const handleSubmit = async () => {
    await update({
      alerts: { orderDays: form.orderDays },
      locale: { currency: form.currency },
      printing: { header: form.header, logoUrl: form.logoUrl },
    });
    alert('Configuración actualizada');
  };

  return (
    <PageShell
      title="Administración"
      description="Ajustes de alertas, moneda y preferencias de impresión."
      actions={<ActionBar onPrint={() => window.print()} onExport={() => api.exportToSheets('Configuración', [form])} />}
    >
      {isLoading || !settings ? (
        <EmptyState title="Cargando configuración" description="Obteniendo preferencias." />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <Card title="Alertas">
            <label className="text-xs uppercase tracking-wide text-slate-400">Días para alerta ámbar</label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-white focus:border-indigo-400 focus:outline-none"
              type="number"
              value={form.orderDays}
              onChange={(event) => setForm((prev) => ({ ...prev, orderDays: Number(event.target.value) }))}
            />
            <button className="mt-4 rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white" onClick={handleSubmit}>
              Guardar
            </button>
          </Card>
          <Card title="Moneda">
            <label className="text-xs uppercase tracking-wide text-slate-400">Moneda principal</label>
            <select
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-white focus:border-indigo-400 focus:outline-none"
              value={form.currency}
              onChange={(event) => setForm((prev) => ({ ...prev, currency: event.target.value }))}
            >
              <option value="MXN">MXN</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
            <button className="mt-4 rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white" onClick={handleSubmit}>
              Guardar
            </button>
          </Card>
          <Card title="Impresión">
            <label className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={form.header}
                onChange={(event) => setForm((prev) => ({ ...prev, header: event.target.checked }))}
                className="h-4 w-4 rounded border-slate-600 bg-slate-900"
              />
              Incluir encabezado
            </label>
            <label className="mt-4 text-xs uppercase tracking-wide text-slate-400">Logo opcional</label>
            <input
              className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-3 text-sm text-white focus:border-indigo-400 focus:outline-none"
              placeholder="URL del logo"
              value={form.logoUrl}
              onChange={(event) => setForm((prev) => ({ ...prev, logoUrl: event.target.value }))}
            />
            <button className="mt-4 rounded-full bg-indigo-500 px-4 py-2 text-sm font-semibold text-white" onClick={handleSubmit}>
              Guardar
            </button>
          </Card>
          <Card title="Accesos rápidos">
            <div className="space-y-3 text-sm text-indigo-300">
              <a href="/equilibrio" className="block rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-3">
                Ir a Punto de equilibrio
              </a>
              <a href="/operarias" className="block rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-3">
                Ver operarias
              </a>
              <a href="/asistencia" className="block rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-4 py-3">
                Revisar asistencia
              </a>
            </div>
          </Card>
        </div>
      )}
    </PageShell>
  );
};

const Card = ({ title, children }: React.PropsWithChildren<{ title: string }>) => (
  <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6">
    <h3 className="text-lg font-semibold text-white">{title}</h3>
    <div className="mt-4 space-y-3">{children}</div>
  </div>
);

export default AdminPage;
