import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const formatCurrency = (value: number, currency: string = 'MXN') =>
  new Intl.NumberFormat('es-MX', { style: 'currency', currency }).format(value);

export const formatDate = (value: string) => format(new Date(value), "dd MMM yyyy", { locale: es });

export const formatDateTime = (value: string) => format(new Date(value), "dd MMM yyyy · HH:mm", { locale: es });

export const clamp = (value: number, min = 0, max = 100) => Math.min(Math.max(value, min), max);
