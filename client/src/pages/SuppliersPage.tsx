import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import PageShell from '../components/PageShell';
import ActionBar from '../components/ActionBar';
import EmptyState from '../components/EmptyState';
import { useApi } from '../context/ApiContext';
import { Material, Supplier } from '../types';

const SuppliersPage = () => {
  const api = useApi();
  const { data, isLoading } = useQuery<Supplier[]>({ queryKey: ['suppliers'], queryFn: api.getSuppliers });
  const { data: materials } = useQuery<Material[]>({ queryKey: ['materials'], queryFn: api.getMaterials });

  const getLinked = useMemo(() => {
    const map = new Map<string, number>();
    materials?.forEach((material) => {
      map.set(material.supplierId, (map.get(material.supplierId) ?? 0) + 1);
    });
    return map;
  }, [materials]);

  return (
    <PageShell
      title="Proveedores"
      description="Directorios fiscales y materiales asociados por proveedor."
      actions={<ActionBar onAdd={() => undefined} onEdit={() => undefined} onPrint={() => window.print()} onExport={() => api.exportToSheets('Proveedores', data ?? [])} />}
    >
      {isLoading ? (
        <EmptyState title="Cargando proveedores" description="Sincronizando base de compras." />
      ) : !data || data.length === 0 ? (
        <EmptyState title="Sin proveedores" description="Registra tus proveedores clave." />
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-800">
          <table className="min-w-full divide-y divide-slate-800/80 text-sm">
            <thead className="bg-slate-900/80 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3 text-left">Nombre</th>
                <th className="px-4 py-3 text-left">RFC</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Teléfono</th>
                <th className="px-4 py-3 text-left">Materiales vinculados</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {data.map((supplier) => (
                <tr key={supplier.id} className="bg-slate-950/60">
                  <td className="px-4 py-4 font-semibold text-white">{supplier.name}</td>
                  <td className="px-4 py-4 text-slate-300">{supplier.taxId}</td>
                  <td className="px-4 py-4 text-slate-300">{supplier.email}</td>
                  <td className="px-4 py-4 text-slate-300">{supplier.phone}</td>
                  <td className="px-4 py-4 text-slate-300">{getLinked.get(supplier.id) ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  );
};

export default SuppliersPage;
