import { startOfHour, parseISO, format } from 'date-fns';
import pt from 'date-fns/locale/pt';

export const getAppointmentDate = date => startOfHour(parseISO(date));

export const getDateAsString = date =>
  format(date, 'd [de] MMMM[, às] H:mm[h]', {
    locale: pt,
  });
