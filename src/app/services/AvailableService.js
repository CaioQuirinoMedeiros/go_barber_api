import {
  startOfDay,
  endOfDay,
  format,
  setSeconds,
  setMinutes,
  setHours,
  isAfter,
} from 'date-fns'
import { Op } from 'sequelize'

import Appointment from '../models/Appointment'

class AvailableService {
  async run({ date, provider_id }) {
    const appointments = await Appointment.findAll({
      where: {
        provider_id,
        canceled_at: null,
        date: {
          [Op.between]: [startOfDay(date), endOfDay(date)],
        },
      },
    })

    const schedule = [
      '11:30',
      '12:00',
      '12:30',
      '13:00',
      '13:30',
      '14:00',
      '14:30',
      '15:00',
      '15:30',
      '16:00',
      '16:30',
      '17:00',
      '17:30',
      '18:00',
      '18:30',
      '19:00',
      '19:30',
      '20:00',
      '20:30',
      '21:00',
      '21:30',
    ]

    const available = schedule.map(time => {
      const [hour, minute] = time.split(':')

      const value = setSeconds(setMinutes(setHours(date, hour), minute), 0)

      return {
        time,
        value: `${format(date, 'yyyy-MM-dd')}T${time}:00.000Z`,
        available:
          isAfter(value, new Date()) &&
          !appointments.find(
            appointment => format(appointment.date, 'HH:mm') === time
          ),
      }
    })

    return available
  }
}

export default new AvailableService()
