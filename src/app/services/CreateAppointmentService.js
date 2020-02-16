import { isPast } from 'date-fns'

import { getAppointmentDate, getDateAsString } from '../helpers/date'

import Mail from '../../services/Mail'

import Appointment from '../models/Appointment'
import Notification from '../schemas/Notification'
import User from '../models/User'

class CreateAppointmentServices {
  async run({ provider_id, user_id, date }) {
    // Check if provider_id is the user himself
    if (user_id === provider_id) {
      throw new Error('Impossível agendar com você mesmo')
    }

    // Check if provider_id is a provider
    const provider = await User.findProvider(provider_id)

    if (!provider) {
      throw new Error('Usuário requisitado não é um prestador')
    }

    const appointmentDate = getAppointmentDate(date)

    // Check if it's a past date
    if (isPast(appointmentDate)) {
      throw new Error('Você não pode voltar no passado')
    }

    // Check if already exists an appointment in this date
    const scheduledAppointment = await Appointment.findByProviderAndDate(
      provider_id,
      appointmentDate
    )

    if (scheduledAppointment) {
      throw new Error('Horário não disponível')
    }

    const user = await User.findByPk(user_id)

    const appointment = await Appointment.create({
      user_id: user.id,
      provider_id,
      date,
    })

    const formatedDate = getDateAsString(appointmentDate)

    await Notification.create({
      content: `Novo agendamento de ${user.name} para o dia ${formatedDate}`,
      user: provider_id,
    })

    await Mail.sendMail({
      subject: 'Novo agendamento',
      to: provider.email,
      template_id: 'd-2eabb272ccc24873b071469e7a7b5770',
      dynamic_template_data: {
        provider: provider.name,
        user: user.name,
        date: formatedDate,
      },
    })

    return appointment
  }
}

export default new CreateAppointmentServices()
