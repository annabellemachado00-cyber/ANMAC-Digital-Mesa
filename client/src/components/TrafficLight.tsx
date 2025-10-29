import clsx from 'clsx';
import { TrafficStatus } from '../types';

const colorMap: Record<TrafficStatus, string> = {
  GREEN: 'bg-verde shadow-verde/40',
  AMBER: 'bg-ambar shadow-ambar/40',
  RED: 'bg-rojo shadow-rojo/40',
};

interface TrafficLightProps {
  status: TrafficStatus;
  label?: string;
}

const TrafficLight = ({ status, label }: TrafficLightProps) => {
  return (
    <div className="flex items-center gap-2">
      <span className={clsx('h-3.5 w-3.5 rounded-full shadow-lg', colorMap[status])} />
      {label && <span className="text-xs uppercase tracking-wider text-slate-400">{label}</span>}
    </div>
  );
};

export default TrafficLight;
