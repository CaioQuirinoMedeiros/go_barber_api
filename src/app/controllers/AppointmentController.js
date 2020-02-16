import Appointment from '../models/Appointment'
import User from '../models/User'
import File from '../models/File'

import CreateAppointmentService from '../services/CreateAppointmentService'
import CancelAppointmentService from '../services/CancelAppointmentService'

class AppointmentController {
  async store(req, res) {
    const { provider_id, date } = req.body

    try {
      const appointment = await CreateAppointmentService.run({
        user_id: req.userId,
        provider_id,
        date,
      })

      return res.status(201).send(appointment)
    } catch (err) {
      console.error(err)
      return res
        .status(400)
        .send({ error: err.message || 'Erro ao marcar consulta' })
    }
  }

  async index(req, res) {
    const { page = 1 } = req.query

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
      })

      return res.status(200).send(appointments)
    } catch (err) {
      console.error(err)
      return res.status(400).send({ error: 'Erro ao buscar suas consultas' })
    }
  }

  async delete(req, res) {
    const { id } = req.params

    try {
      const appointment = await CancelAppointmentService.run({
        appointment_id: id,
        user_id: req.userId,
      })

      return res.status(200).send(appointment)
    } catch (err) {
      console.error(err)
      return res
        .status(400)
        .send({ error: err.message || 'Erro ao cancelar consulta' })
    }
  }
}

export default new AppointmentController()
