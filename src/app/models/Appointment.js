import Sequelize, { Model } from 'sequelize'
import { isBefore, subHours, isPast } from 'date-fns'

class Appointment extends Model {
  static init(sequelize) {
    super.init(
      {
        date: Sequelize.STRING,
        canceled_at: Sequelize.STRING,
        past: {
          type: Sequelize.VIRTUAL,
          get() {
            return isPast(this.date)
          },
        },
        cancelable: {
          type: Sequelize.VIRTUAL,
          get() {
            return isBefore(new Date(), subHours(this.date, 2))
          },
        },
      },
      {
        sequelize,
      }
    )

    return this
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' })
    this.belongsTo(models.User, { foreignKey: 'provider_id', as: 'provider' })
  }

  static async findByProviderAndDate(provider_id, date) {
    const app = await this.findOne({
      where: { provider_id, date, canceled_at: null },
    })

    return app
  }
}

export default Appointment
