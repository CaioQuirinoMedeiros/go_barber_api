import User from '../models/User'
import File from '../models/File'

class UserController {
  async store(req, res) {
    try {
      const userExists = await User.findByEmail(req.body.email)

      if (userExists) {
        return res.status(400).send({ error: 'Usuário já existe' })
      }

      const user = await User.create(req.body)

      const { id, name, email, provider } = user

      return res.status(200).send({ id, name, email, provider })
    } catch (err) {
      console.error(err)
      return res.status(400).send({ error: 'Erro ao criar usuário' })
    }
  }

  async update(req, res) {
    const { email, password, oldPassword } = req.body

    try {
      let user = await User.findByPk(req.userId)

      if (email && email !== user.email) {
        const userExists = await User.findByEmail(email)

        if (userExists) {
          return res.status(400).send({ error: 'Usuário já existe' })
        }
      }

      if (password) {
        if (!oldPassword) {
          return res
            .status(401)
            .send({ error: 'Necessário fornecer senha atual' })
        }

        const passwordMatch = await user.checkPassword(oldPassword)

        if (!passwordMatch) {
          return res.status(401).send({ error: 'Senha inválida' })
        }
      }

      await user.update(req.body)

      user = await User.findByPk(user.id, {
        include: [{ model: File, as: 'avatar' }],
      })

      return res.status(200).send(user)
    } catch (err) {
      console.error(err)
      return res.status(400).send({ error: 'Erro ao editar usuário' })
    }
  }
}

export default new UserController()
