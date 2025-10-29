import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PageShell from '../components/PageShell';
import ActionBar from '../components/ActionBar';
import EmptyState from '../components/EmptyState';
import StatusChip from '../components/StatusChip';
import { useApi } from '../context/ApiContext';
import { Material, Movement } from '../types';

const InventoryPage = () => {
  const api = useApi();
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery<Material[]>({ queryKey: ['materials'], queryFn: api.getMaterials });
  const movementMutation = useMutation({
    mutationFn: async (movement: Partial<Movement>) => {
      const created = await api.createMovement(movement);
      await api.applyMovement(created.id);
      return created;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materials'] });
    },
  });

  const legend =
    'Monitorea el inventario con semáforos de stock. Ajusta entradas/salidas con control de disponibilidad y genera incidencias de compra.';

  const handleAdjust = (material: Material, type: Movement['type']) => {
    const qty = Number(prompt(`Cantidad a ${type === 'IN' ? 'agregar' : 'retirar'}`));
    if (!Number.isFinite(qty) || qty <= 0) return;
    movementMutation.mutate({
      type,
      materialId: material.id,
      qty,
      ref: 'Ajuste manual',
      at: new Date().toISOString(),
    });
  };

  return (
    <PageShell
      title="Inventario de materiales"
      description="Disponibilidad, reservas y alertas de reorden para cada material."
      legend={legend}
      actions={<ActionBar onAdd={() => undefined} onPrint={() => window.print()} onExport={() => api.exportToSheets('Inventario (Stock)', data ?? [])} addLabel="Agregar material" />}
    >
      {isLoading ? (
        <EmptyState title="Cargando inventario" description="Sincronizando datos." />
      ) : !data || data.length === 0 ? (
        <EmptyState
          title="No hay materiales"
          description="Registra materiales para controlar existencias."
          actionLabel="Agregar"
        />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-800">
          <table className="min-w-full divide-y divide-slate-800/80 text-sm">
            <thead className="bg-slate-900/80 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3 text-left">Material</th>
                <th className="px-4 py-3 text-left">Proveedor</th>
                <th className="px-4 py-3 text-left">On hand</th>
                <th className="px-4 py-3 text-left">Reservado</th>
                <th className="px-4 py-3 text-left">Disponible</th>
                <th className="px-4 py-3 text-left">UOM</th>
                <th className="px-4 py-3 text-left">ROP</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3 text-left">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {data.map((material) => (
                <tr key={material.id} className="bg-slate-950/60">
                  <td className="px-4 py-4 font-semibold text-white">{material.name}</td>
                  <td className="px-4 py-4 text-slate-300">{material.supplierName}</td>
                  <td className="px-4 py-4 text-slate-300">{material.onHand}</td>
                  <td className="px-4 py-4 text-slate-300">{material.reserved}</td>
                  <td className="px-4 py-4 text-slate-200">{material.available}</td>
                  <td className="px-4 py-4 text-slate-300">{material.uom}</td>
                  <td className="px-4 py-4 text-slate-300">{material.reorderPoint}</td>
                  <td className="px-4 py-4">
                    <StatusChip
                      label={material.statusStock}
                      variant={
                        material.statusStock === 'Crítico'
                          ? 'danger'
                          : material.statusStock === 'Bajo'
                          ? 'warning'
                          : 'success'
                      }
                    />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2 text-xs">
                      <button className="rounded-full border border-slate-700 px-3 py-1 text-white">Editar</button>
                      <button
                        className="rounded-full border border-emerald-500/40 px-3 py-1 text-emerald-200"
                        onClick={() => handleAdjust(material, 'IN')}
                      >
                        Ajuste (+)
                      </button>
                      <button
                        className="rounded-full border border-rose-500/40 px-3 py-1 text-rose-200"
                        onClick={() => handleAdjust(material, 'OUT')}
                      >
                        Ajuste (–)
                      </button>
                      <button className="rounded-full border border-amber-400/40 px-3 py-1 text-amber-200">
                        Solicitar compra
                      </button>
                      <button className="rounded-full border border-slate-700 px-3 py-1 text-slate-200">Eliminar</button>
                    </div>
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

export default InventoryPage;
