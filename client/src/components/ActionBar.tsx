import { PrinterIcon, PlusIcon, PencilSquareIcon, TrashIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import clsx from 'clsx';

interface ActionBarProps {
  onAdd?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onPrint?: () => void;
  onExport?: () => void;
  disableEdit?: boolean;
  disableDelete?: boolean;
  disablePrint?: boolean;
  disableExport?: boolean;
  addLabel?: string;
}

const ActionBar = ({
  onAdd,
  onEdit,
  onDelete,
  onPrint,
  onExport,
  disableDelete,
  disableEdit,
  disableExport,
  disablePrint,
  addLabel = 'Agregar',
}: ActionBarProps) => {
  const buttonClasses =
    'flex items-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40';

  return (
    <div className="mb-6 flex flex-wrap items-center gap-3">
      <button
        onClick={onAdd}
        className={clsx(buttonClasses, 'bg-indigo-500 text-white hover:bg-indigo-400')}
      >
        <PlusIcon className="h-4 w-4" /> {addLabel}
      </button>
      <button
        onClick={onEdit}
        disabled={disableEdit}
        className={clsx(buttonClasses, 'border border-slate-700 text-slate-200 hover:border-indigo-400 hover:text-white')}
      >
        <PencilSquareIcon className="h-4 w-4" /> Editar
      </button>
      <button
        onClick={onDelete}
        disabled={disableDelete}
        className={clsx(buttonClasses, 'border border-rose-500/40 text-rose-300 hover:border-rose-400 hover:text-rose-200')}
      >
        <TrashIcon className="h-4 w-4" /> Eliminar
      </button>
      <button
        onClick={onPrint}
        disabled={disablePrint}
        className={clsx(buttonClasses, 'border border-slate-700 text-slate-200 hover:border-indigo-400 hover:text-white')}
      >
        <PrinterIcon className="h-4 w-4" /> Imprimir / PDF
      </button>
      <button
        onClick={onExport}
        disabled={disableExport}
        className={clsx(buttonClasses, 'border border-emerald-500/40 text-emerald-300 hover:border-emerald-400 hover:text-emerald-100')}
      >
        <ArrowDownTrayIcon className="h-4 w-4" /> Exportar
      </button>
    </div>
  );
};

export default ActionBar;
