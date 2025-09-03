import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

export const tiempoTranscurrido = (fecha) => {
  if (!fecha) return 'Fecha inválida';
  return formatDistanceToNow(new Date(fecha), {
    addSuffix: true,
    locale: es,
  });
};