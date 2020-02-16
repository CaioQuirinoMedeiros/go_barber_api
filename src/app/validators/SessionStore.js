import * as Yup from 'yup'

export default async (req, res, next) => {
  try {
    const schema = Yup.object().shape({
      email: Yup.string()
        .email('Não é um email válido')
        .required('Forneça seu email'),
      password: Yup.string().required('Forneça sua senha secreta'),
    })

    await schema.validate(req.body)
    return next()
  } catch (err) {
    return res.status(400).send({ error: err.message })
  }
}
