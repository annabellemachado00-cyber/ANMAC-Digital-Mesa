import clsx from 'clsx';

interface StatusChipProps {
  label: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

const palette = {
  default: 'bg-slate-800/70 text-slate-200 border border-slate-700/60',
  success: 'bg-verde/10 text-verde border border-verde/40',
  warning: 'bg-ambar/10 text-ambar border border-ambar/40',
  danger: 'bg-rojo/10 text-rojo border border-rojo/50',
};

const StatusChip = ({ label, variant = 'default' }: StatusChipProps) => (
  <span className={clsx('inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide', palette[variant])}>
    {label}
  </span>
);

export default StatusChip;
