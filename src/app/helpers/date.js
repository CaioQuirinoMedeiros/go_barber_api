import { startOfHour, parse, format } from 'date-fns';
import pt from 'date-fns/locale/pt';

export const getAppointmentDate = date => startOfHour(parse(date));

export const getDateAsString = date =>
  format(date, 'D [de] MMMM[, às] H:mm[h]', {
    locale: pt,
  });
