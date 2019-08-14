import { Op } from 'sequelize';
import { startOfDay, endOfDay, parse } from 'date-fns';

import Appointment from '../models/Appointment';
import User from '../models/User';

class ScheduleController {
  async index(req, res) {
    try {
      const provider = await User.findProvider(req.userId);

      if (!provider) {
        return res.status(400).send({ error: 'User is not a provider' });
      }

      const { date } = req.query;

      const parsedDate = parse(date);

      const appointments = await Appointment.findAll({
        where: {
          provider_id: req.userId,
          canceled_at: null,
          date: {
            [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)],
          },
        },
        order: ['date'],
      });

      return res.status(200).send(appointments);
    } catch (err) {
      return res.status(400).send({ error: 'Unable to get schedule' });
    }
  }
}

export default new ScheduleController();
