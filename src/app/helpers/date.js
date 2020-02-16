import { startOfHour, parseISO, format } from 'date-fns'
import pt from 'date-fns/locale/pt'

export const getAppointmentDate = date => startOfHour(parseISO(date))

export const getDateAsString = date => format(date, 'Pp', { locale: pt })
