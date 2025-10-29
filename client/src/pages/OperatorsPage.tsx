import { useQuery } from '@tanstack/react-query';
import PageShell from '../components/PageShell';
import ActionBar from '../components/ActionBar';
import EmptyState from '../components/EmptyState';
import StatusChip from '../components/StatusChip';
import { useApi } from '../context/ApiContext';
import { Operator } from '../types';

const OperatorsPage = () => {
  const api = useApi();
  const { data, isLoading } = useQuery<Operator[]>({ queryKey: ['operators'], queryFn: api.getOperators });

  return (
    <PageShell
      title="Operarias"
      description="Talento en piso con tarifas, turnos y estatus de actividad."
      actions={<ActionBar onAdd={() => undefined} onEdit={() => undefined} onPrint={() => window.print()} onExport={() => api.exportToSheets('Operarias', data ?? [])} />}
    >
      {isLoading ? (
        <EmptyState title="Cargando operarias" description="Sincronizando recursos humanos." />
      ) : !data || data.length === 0 ? (
        <EmptyState title="No hay operarias" description="Registra tu primer operaria para iniciar el control." />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-800">
          <table className="min-w-full divide-y divide-slate-800/80 text-sm">
            <thead className="bg-slate-900/80 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">Puesto</th>
                <th className="px-4 py-3 text-left">Tarifa hora</th>
                <th className="px-4 py-3 text-left">Turno</th>
                <th className="px-4 py-3 text-left">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {data.map((operator) => (
                <tr key={operator.id} className="bg-slate-950/60">
                  <td className="px-4 py-4 font-semibold text-white">{operator.name}</td>
                  <td className="px-4 py-4 text-slate-300">{operator.puesto}</td>
                  <td className="px-4 py-4 text-slate-300">${operator.hourRate} MXN</td>
                  <td className="px-4 py-4 text-slate-300">{operator.shift}</td>
                  <td className="px-4 py-4">
                    <StatusChip label={operator.active ? 'Activa' : 'Inactiva'} variant={operator.active ? 'success' : 'danger'} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  );
};

export default OperatorsPage;
