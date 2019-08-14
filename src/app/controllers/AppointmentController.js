import * as Yup from 'yup';
import { startOfHour, parse, isBefore, format } from 'date-fns';

import Appointment from '../models/Appointment';
import User from '../models/User';
import File from '../models/File';

class AppointmentController {
  async store(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });

    const isValid = await schema.isValid(req.body);

    if (!isValid) {
      return res.status(400).send({ error: 'Validation fails' });
    }

    const { provider_id, date } = req.body;

    try {
      const provider = await User.findProvider(provider_id);

      if (!provider) {
        return res
          .status(400)
          .send({ error: 'Provider requested is not actually a provider' });
      }

      const parsedDate = parse(date);

      const hourStart = startOfHour(parsedDate);

      if (isBefore(hourStart, new Date())) {
        return res.status(400).send({ error: "You can't go back in the past" });
      }

      const scheduledAppointment = await Appointment.findByProviderAndDate(
        provider_id,
        hourStart
      );

      if (scheduledAppointment) {
        return res
          .status(400)
          .send({ error: 'Appointment date is not available' });
      }

      const user = await User.findByPk(req.userId);

      const appointment = await Appointment.create({
        user_id: user.id,
        provider_id,
        date: format(hourStart),
      });

      return res.status(201).send({ appointment, hourStart, parsedDate });
    } catch (err) {
      return res.status(400).send({ error: 'Unable to create appointment' });
    }
  }

  async index(req, res) {
    const appointments = await Appointment.findAll({
      where: { user_id: req.userId, canceled_at: null },
      order: ['date'],
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            { model: File, as: 'avatar', attributes: ['id', 'path', 'url'] },
          ],
        },
      ],
      attributes: ['id', 'date'],
    });

    return res.status(200).send(appointments);
  }
}

export default new AppointmentController();
