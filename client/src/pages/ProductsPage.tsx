import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog } from '@headlessui/react';
import PageShell from '../components/PageShell';
import ActionBar from '../components/ActionBar';
import EmptyState from '../components/EmptyState';
import StatusChip from '../components/StatusChip';
import { useApi } from '../context/ApiContext';
import { useSettings } from '../context/SettingsContext';
import { Product } from '../types';
import { formatCurrency } from '../utils/formatters';

const ProductsPage = () => {
  const api = useApi();
  const { settings } = useSettings();
  const currency = settings?.locale.currency ?? 'MXN';
  const { data, isLoading } = useQuery<Product[]>({ queryKey: ['products'], queryFn: api.getProducts });
  const [drawerProduct, setDrawerProduct] = useState<Product | null>(null);
  const [showSkuModal, setShowSkuModal] = useState(false);
  const [skuForm, setSkuForm] = useState({ categoria: '', silueta: '', tela: '', temporada: '', color: '', talla: '' });

  const legend =
    'Genera SKUs consistentes combinando atributos clave y consulta el tiempo estándar y materiales del producto en la ficha.';

  const handleGenerateSku = () => {
    const fullSku = `${skuForm.categoria}-${skuForm.silueta}-${skuForm.temporada}-${skuForm.color}-${skuForm.talla}`
      .toUpperCase()
      .replace(/\s+/g, '-');
    const shortSku = `${skuForm.categoria.slice(0, 3)}-${skuForm.color.slice(0, 2)}-${skuForm.talla}`.toUpperCase();
    alert(`SKU generado\nCompleto: ${fullSku}\nCorto: ${shortSku}`);
    setShowSkuModal(false);
  };

  return (
    <PageShell
      title="Catálogo de productos"
      description="Ficha técnica, materiales y tiempos estándar para cada diseño."
      legend={legend}
      actions={<ActionBar onAdd={() => undefined} onPrint={() => window.print()} onExport={() => api.exportToSheets('Productos', data ?? [])} addLabel="Agregar producto" />}
    >
      {isLoading ? (
        <EmptyState title="Cargando productos" description="Consulta en proceso." />
      ) : !data || data.length === 0 ? (
        <EmptyState
          title="Aún no hay productos"
          description="Registra tu primer producto para comenzar a planear colecciones."
          actionLabel="Generar SKU"
          onAction={() => setShowSkuModal(true)}
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {data.map((product) => (
            <article
              key={product.id}
              className="flex flex-col justify-between rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-lg shadow-indigo-500/10 transition hover:border-indigo-400"
              onClick={() => setDrawerProduct(product)}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">{product.name}</h3>
                  <StatusChip label={product.season} />
                </div>
                <p className="text-sm text-slate-400">SKU: {product.sku}</p>
                <p className="text-xs uppercase tracking-wide text-slate-500">SKU corto: {product.skuShort}</p>
                <div className="grid grid-cols-2 gap-3 text-xs text-slate-300">
                  <span>Programa: {product.program}</span>
                  <span>Fit: {product.fit}</span>
                  <span>Género: {product.gender}</span>
                  <span>Tiempo estándar: {product.stdTimeMin} min</span>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between text-xs text-slate-400">
                <span>Categoria · {product.category}</span>
                {product.price && <span>Precio sugerido {formatCurrency(product.price, currency)}</span>}
              </div>
            </article>
          ))}
        </div>
      )}
      {drawerProduct && <ProductDrawer product={drawerProduct} onClose={() => setDrawerProduct(null)} currency={currency} />}
      {showSkuModal && (
        <Dialog open={showSkuModal} onClose={() => setShowSkuModal(false)} className="relative z-50">
          <div className="fixed inset-0 bg-slate-950/70" aria-hidden="true" />
          <div className="fixed inset-0 flex items-center justify-center p-6">
            <Dialog.Panel className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-950/90 p-6">
              <Dialog.Title className="text-lg font-semibold text-white">Generador de SKU</Dialog.Title>
              <p className="mt-1 text-sm text-slate-400">Completa los atributos para construir el SKU automáticamente.</p>
              <div className="mt-6 grid gap-4">
                {Object.entries(skuForm).map(([key, value]) => (
                  <div key={key}>
                    <label className="text-xs uppercase tracking-wide text-slate-500">{key}</label>
                    <input
                      className="mt-2 w-full rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-sm text-white focus:border-indigo-400 focus:outline-none"
                      value={value}
                      onChange={(event) => setSkuForm((prev) => ({ ...prev, [key]: event.target.value }))}
                      placeholder={`Ingresa ${key}`}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-end gap-3 text-sm">
                <button className="rounded-full border border-slate-700 px-5 py-2 text-white" onClick={() => setShowSkuModal(false)}>
                  Cancelar
                </button>
                <button className="rounded-full bg-indigo-500 px-5 py-2 font-semibold text-white" onClick={handleGenerateSku}>
                  Generar y copiar
                </button>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>
      )}
    </PageShell>
  );
};

const ProductDrawer = ({ product, onClose, currency }: { product: Product; onClose: () => void; currency: string }) => (
  <div className="fixed inset-0 z-40 flex justify-end bg-slate-950/60 backdrop-blur-sm">
    <div className="h-full w-full max-w-xl overflow-y-auto border-l border-slate-800 bg-slate-950/90 p-8">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-semibold text-white">{product.name}</h3>
          <p className="text-xs uppercase tracking-wide text-slate-400">{product.sku}</p>
        </div>
        <button onClick={onClose} className="text-sm text-slate-400 hover:text-white">
          Cerrar
        </button>
      </div>
      <div className="mt-6 grid gap-3 text-sm text-slate-300">
        <InfoRow label="Programa" value={product.program} />
        <InfoRow label="Silueta" value={product.silhouette} />
        <InfoRow label="Temporada" value={product.season} />
        <InfoRow label="Color" value={product.color} />
        <InfoRow label="Talla" value={product.size} />
        <InfoRow label="Tiempo estándar" value={`${product.stdTimeMin} minutos`} />
      </div>
      <div className="mt-6">
        <h4 className="text-sm font-semibold text-white">Lista de materiales</h4>
        <div className="mt-3 space-y-3">
          {product.bom?.map((item) => (
            <div key={item.materialId} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-3 text-xs text-slate-300">
              <div className="flex items-center justify-between text-white">
                <span className="font-semibold">{item.materialName}</span>
                <span>
                  {item.qty} {item.uom}
                </span>
              </div>
              <p className="mt-1 text-slate-400">Costo {formatCurrency(item.cost, currency)}</p>
            </div>
          )) || <p className="text-xs text-slate-500">Sin materiales registrados.</p>}
        </div>
      </div>
    </div>
  </div>
);

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
    <p className="text-sm font-semibold text-white">{value}</p>
  </div>
);

export default ProductsPage;
