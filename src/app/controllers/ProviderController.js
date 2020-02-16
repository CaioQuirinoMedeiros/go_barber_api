import User from '../models/User'
import File from '../models/File'

class ProviderCotroller {
  async index(req, res) {
    try {
      const providers = await User.findAll({
        where: { provider: true },
        include: [
          { model: File, as: 'avatar', attributes: ['name', 'path', 'url'] },
        ],
      })

      return res.status(200).send(providers)
    } catch (err) {
      console.error(err)
      return res.status(400).send({ error: 'Erro ao buscar prestadores' })
    }
  }
}

export default new ProviderCotroller()
