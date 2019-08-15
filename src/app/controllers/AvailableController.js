import {
  startOfDay,
  endOfDay,
  setHours,
  setMinutes,
  setSeconds,
  format,
  isAfter,
} from 'date-fns';
import { Op } from 'sequelize';

import Appointment from '../models/Appointment';

class AvailableController {
  async index(req, res) {
    const { date } = req.query;
    const { id } = req.params;

    if (!date) {
      return res.status(400).send({ error: 'Invalid date' });
    }

    const searchDate = parseInt(date, 10);

    try {
      const appointments = await Appointment.findAll({
        where: {
          provider_id: id,
          canceled_at: null,
          date: {
            [Op.between]: [startOfDay(searchDate), endOfDay(searchDate)],
          },
        },
      });

      const schedule = [
        '08:00',
        '09:00',
        '10:00',
        '11:00',
        '12:00',
        '13:00',
        '14:00',
        '15:00',
        '16:00',
        '17:00',
        '18:00',
      ];

      const available = schedule.map(time => {
        const [hour, minute] = time.split(':');

        const value = setSeconds(
          setMinutes(setHours(searchDate, hour), minute),
          0
        );

        return {
          time,
          value: format(value, 'YYYY-MM-DD[T]HH:mm:ssZ'),
          available:
            isAfter(value, new Date()) &&
            !appointments.find(
              appointment => format(appointment.date, 'HH:mm') === time
            ),
        };
      });

      return res.status(200).send(available);
    } catch (err) {
      console.log(err);
      return res.status(400).send({ error: 'Unable to get available dates' });
    }
  }
}

export default new AvailableController();
