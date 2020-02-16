import { Op } from 'sequelize'
import { startOfDay, endOfDay, parseISO } from 'date-fns'

import Appointment from '../models/Appointment'
import User from '../models/User'

class ScheduleController {
  async index(req, res) {
    try {
      const provider = await User.findProvider(req.userId)

      if (!provider) {
        return res.status(400).send({ error: 'Usuário não é um prestador' })
      }

      const { date } = req.query

      const parsedDate = parseISO(date)

      const appointments = await Appointment.findAll({
        where: {
          provider_id: req.userId,
          canceled_at: null,
          date: {
            [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)],
          },
        },
        include: [{ model: User, as: 'user', attributes: ['name'] }],
        order: ['date'],
      })

      return res.status(200).send(appointments)
    } catch (err) {
      console.error(err)
      return res.status(400).send({ error: 'Erro ao buscar cronograma' })
    }
  }
}

export default new ScheduleController()
