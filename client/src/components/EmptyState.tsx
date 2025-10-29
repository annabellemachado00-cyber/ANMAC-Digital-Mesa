interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

const EmptyState = ({ title, description, actionLabel, onAction }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700/70 bg-slate-900/40 p-12 text-center text-slate-300">
    <h3 className="text-lg font-semibold text-white">{title}</h3>
    <p className="mt-2 max-w-md text-sm text-slate-400">{description}</p>
    {actionLabel && (
      <button
        onClick={onAction}
        className="mt-6 rounded-full bg-indigo-500/90 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-400"
      >
        {actionLabel}
      </button>
    )}
  </div>
);

export default EmptyState;
