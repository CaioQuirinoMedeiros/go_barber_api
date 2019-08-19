import { format } from 'date-fns';

import { getDateAsString } from '../helpers/date';

import Appointment from '../models/Appointment';
import User from '../models/User';
import File from '../models/File';
import Notification from '../schemas/Notification';
import Mail from '../../services/Mail';

import CreateAppointmentService from '../services/CreateAppointmentService';

class AppointmentController {
  async store(req, res) {
    const { provider_id, date } = req.body;
    try {
      const appointment = await CreateAppointmentService.run({
        user_id: req.userId,
        provider_id,
        date,
      });

      return res.status(201).send(appointment);
    } catch (err) {
      return res
        .status(400)
        .send({ error: err.message || 'Erro ao marcar consulta' });
    }
  }

  async index(req, res) {
    const { page = 1 } = req.query;

    try {
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
    } catch (err) {
      return res.status(400).send({ error: 'Erro ao buscar suas consultas' });
    }
  }

  async delete(req, res) {
    const { id } = req.params;

    try {
      const appointment = await Appointment.findByPk(id);

      if (!appointment) {
        return res.status(404).send({ error: 'Consulta não encontrada' });
      }

      if (appointment.user_id !== req.userId) {
        return res.status(401).send({
          error: 'Você não tem permissão para cancelar essa consulta',
        });
      }

      if (!appointment.cancelable) {
        return res
          .status(400)
          .send({ error: 'Tarde demais para cancelar consulta' });
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
      return res.status(400).send({ error: 'Erro ao cancelar consulta' });
    }
  }
}

export default new AppointmentController();
