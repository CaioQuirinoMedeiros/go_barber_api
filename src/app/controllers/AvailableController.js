import AvailableService from '../services/AvailableService'

class AvailableController {
  async index(req, res) {
    const { date } = req.query
    const { id } = req.params

    if (!date) {
      return res.status(400).send({ error: 'Data inválida' })
    }

    const searchDate = parseInt(date, 10)

    try {
      const available = await AvailableService.run({
        date: searchDate,
        provider_id: id,
      })

      return res.status(200).send(available)
    } catch (err) {
      console.error(err)
      return res
        .status(400)
        .send({ error: 'Erro ao buscar horários disponíveis' })
    }
  }
}

export default new AvailableController()
