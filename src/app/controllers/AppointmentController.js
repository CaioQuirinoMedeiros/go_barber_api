import * as Yup from 'yup';
import { format, isPast } from 'date-fns';

import { getAppointmentDate, getDateAsString } from '../helpers/date';

import Appointment from '../models/Appointment';
import User from '../models/User';
import File from '../models/File';
import Notification from '../schemas/Notification';
import Mail from '../../services/Mail';

class AppointmentController {
  async store(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required(),
    });

    const { provider_id, date } = req.body;

    const isValid = await schema.isValid({ provider_id, date });

    if (!isValid) {
      return res.status(400).send({ error: 'Validation fails' });
    }

    try {
      // Check if provider_id is the user himself
      if (req.userId === provider_id) {
        return res
          .status(400)
          .send({ error: "You can't schedule an appointment with yourself" });
      }

      // Check if provider_id is a provider
      const provider = await User.findProvider(provider_id);

      if (!provider) {
        return res
          .status(404)
          .send({ error: "Provider not found or it's not a provider" });
      }

      const appointmentDate = getAppointmentDate(date);

      // Check if it's a past date
      if (isPast(appointmentDate)) {
        return res.status(400).send({ error: "You can't go back in the past" });
      }

      // Check if already exists an appointment in this date
      const scheduledAppointment = await Appointment.findByProviderAndDate(
        provider_id,
        appointmentDate
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
        date: format(appointmentDate),
      });

      const formatedDate = getDateAsString(appointmentDate);

      await Notification.create({
        content: `Novo agendamento de ${user.name} para o dia ${formatedDate}`,
        user: provider_id,
      });

      await Mail.sendMail({
        subject: 'Novo agendamento',
        to: provider.email,
        template_id: 'd-2eabb272ccc24873b071469e7a7b5770',
        dynamic_template_data: {
          provider: provider.name,
          user: user.name,
          date: formatedDate,
        },
      });

      return res.status(201).send(appointment);
    } catch (err) {
      return res.status(400).send({ error: 'Unable to create appointment' });
    }
  }

  async index(req, res) {
    const { page = 1 } = req.query;

    const appointments = await Appointment.findAll({
      where: { user_id: req.userId, canceled_at: null },
      order: ['date'],
      attributes: ['id', 'date', 'past', 'cancelable'],
      limit: 20,
      offset: (page - 1) * 20,
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
    });

    return res.status(200).send(appointments);
  }

  async delete(req, res) {
    const { id } = req.params;

    try {
      const appointment = await Appointment.findByPk(id);

      if (!appointment) {
        return res.status(404).send({ error: 'Appointment not found' });
      }

      if (appointment.user_id !== req.userId) {
        return res.status(401).send({
          error: "You don't have permission to cancel this appointment",
        });
      }

      if (!appointment.cancelable) {
        return res
          .status(400)
          .send({ error: 'Too late to cancel the appointment' });
      }

      appointment.canceled_at = format(new Date());

      await appointment.save();

      const provider = await User.findByPk(appointment.provider_id);
      const user = await User.findByPk(req.userId);

      await Notification.create({
        content: `Atenção! O agendamento de ${
          user.name
        } para o dia ${getDateAsString(
          appointment.date
        )} foi cancelado. A data está disponível para novos agendamento`,
        user: provider.id,
      });

      await Mail.sendMail({
        subject: 'Agendamento cancelado',
        to: provider.email,
        template_id: 'd-98b4482d2f4145cfaeb2f259aea20c7e',
        dynamic_template_data: {
          provider: provider.name,
          user: user.name,
          date: getDateAsString(appointment.date),
        },
      });

      return res.status(200).send(appointment);
    } catch (err) {
      return res.status(400).send({ error: 'Unable to cancel appointment' });
    }
  }
}

export default new AppointmentController();
