import { format } from 'date-fns'

import Appointment from '../models/Appointment'
import Notification from '../schemas/Notification'
import User from '../models/User'

import Mail from '../../services/Mail'

import { getDateAsString } from '../helpers/date'

class CancelAppointmentService {
  async run({ appointment_id, user_id }) {
    const appointment = await Appointment.findByPk(appointment_id)

    if (!appointment) {
      throw new Error('Consulta não encontrada')
    }

    if (appointment.user_id !== user_id) {
      throw new Error('Você não tem permissão para cancelar essa consulta')
    }

    if (!appointment.cancelable) {
      throw new Error('Tarde demais para cancelar consulta')
    }

    appointment.canceled_at = format(new Date(), 'yyyy-MM-dd HH:mm:ss')

    await appointment.save()

    const provider = await User.findByPk(appointment.provider_id)
    const user = await User.findByPk(user_id)

    await Notification.create({
      content: `Atenção! O agendamento de ${
        user.name
      } para o dia ${getDateAsString(
        appointment.date
      )} foi cancelado. A data está disponível para novos agendamento`,
      user: provider.id,
    })

    await Mail.sendMail({
      subject: 'Agendamento cancelado',
      to: provider.email,
      template_id: 'd-98b4482d2f4145cfaeb2f259aea20c7e',
      dynamic_template_data: {
        provider: provider.name,
        user: user.name,
        date: getDateAsString(appointment.date),
      },
    })

    return appointment
  }
}

export default new CancelAppointmentService()
