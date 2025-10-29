import { differenceInCalendarDays, isAfter, parseISO } from 'date-fns';
import { Material, Order, Settings, TrafficStatus } from './types';

export const computeSlackDays = (order: Order): number => {
  const today = new Date();
  const promised = parseISO(order.promisedDate);
  return differenceInCalendarDays(promised, today);
};

export const computeTrafficStatus = (order: Order, settings: Settings): TrafficStatus => {
  const today = new Date();
  const promised = parseISO(order.promisedDate);
  if (!['TERMINADO', 'CANCELADO'].includes(order.status)) {
    if (isAfter(today, promised)) {
      return 'RED';
    }
    const slack = computeSlackDays(order);
    if (slack <= settings.alerts.orderDays) {
      return 'AMBER';
    }
  }
  return 'GREEN';
};

export const computeMaterialStatus = (material: Material): 'Normal' | 'Bajo' | 'Crítico' => {
  if (material.available <= 0) {
    return 'Crítico';
  }
  if (material.available < material.reorderPoint) {
    return 'Bajo';
  }
  return 'Normal';
};
