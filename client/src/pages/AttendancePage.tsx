import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import PageShell from '../components/PageShell';
import ActionBar from '../components/ActionBar';
import EmptyState from '../components/EmptyState';
import { useApi } from '../context/ApiContext';
import { Attendance } from '../types';
import { formatDateTime } from '../utils/formatters';

const AttendancePage = () => {
  const api = useApi();
  const { data, isLoading } = useQuery<Attendance[]>({ queryKey: ['attendance'], queryFn: api.getAttendance });

  const rows = useMemo(() => {
    if (!data) return [];
    return data.map((entry) => ({
      ...entry,
      duration: '—',
    }));
  }, [data]);

  return (
    <PageShell
      title="Asistencia"
      description="Control horario por operaria con registro IN/OUT."
      actions={<ActionBar onAdd={() => undefined} onPrint={() => window.print()} onExport={() => api.exportToSheets('Asistencia', rows)} addLabel="Registrar asistencia" />}
    >
      {isLoading ? (
        <EmptyState title="Cargando asistencias" description="Sincronizando entradas y salidas." />
      ) : rows.length === 0 ? (
        <EmptyState title="Sin registros" description="Aún no hay controles de asistencia." />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-800">
          <table className="min-w-full divide-y divide-slate-800/80 text-sm">
            <thead className="bg-slate-900/80 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3 text-left">Fecha / hora</th>
                <th className="px-4 py-3 text-left">Operaria</th>
                <th className="px-4 py-3 text-left">Tipo</th>
                <th className="px-4 py-3 text-left">Duración</th>
                <th className="px-4 py-3 text-left">Observaciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {rows.map((entry) => (
                <tr key={entry.id} className="bg-slate-950/60">
                  <td className="px-4 py-4 text-slate-300">{formatDateTime(entry.at)}</td>
                  <td className="px-4 py-4 text-slate-300">{entry.operatorName}</td>
                  <td className="px-4 py-4 text-slate-300">{entry.type}</td>
                  <td className="px-4 py-4 text-slate-300">{entry.duration}</td>
                  <td className="px-4 py-4 text-slate-400">{entry.note ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  );
};

export default AttendancePage;
