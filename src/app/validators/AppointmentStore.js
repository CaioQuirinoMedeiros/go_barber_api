import * as Yup from 'yup'

export default async (req, res, next) => {
  try {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required('Especifique o prestador'),
      date: Yup.date('Não é uma data válida').required(
        'Especifique uma data e horário'
      ),
    })

    await schema.validate(req.body)
    return next()
  } catch (err) {
    return res.status(400).send({ error: err.message })
  }
}
