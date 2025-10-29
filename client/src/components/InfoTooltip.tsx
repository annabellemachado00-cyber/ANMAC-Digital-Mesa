import { InformationCircleIcon } from '@heroicons/react/24/outline';
import { useState } from 'react';

interface InfoTooltipProps {
  text: string;
}

const InfoTooltip = ({ text }: InfoTooltipProps) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <InformationCircleIcon className="h-5 w-5 text-indigo-300" />
      {open && (
        <div className="absolute left-6 top-1/2 z-20 w-72 -translate-y-1/2 rounded-xl border border-indigo-500/40 bg-slate-900/90 p-4 text-xs text-slate-200 shadow-xl">
          {text}
        </div>
      )}
    </div>
  );
};

export default InfoTooltip;
