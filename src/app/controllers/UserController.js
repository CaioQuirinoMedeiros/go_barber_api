import { unlink } from 'fs'
import { resolve } from 'path'

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

  async removeAvatar(req, res) {
    const { user } = req

    if (!user.avatar) {
      return res.status(400).send({ error: 'Não possui avatar para remover' })
    }

    try {
      const imagePath = resolve(
        __dirname,
        '..',
        '..',
        '..',
        'tmp',
        'uploads',
        user.avatar.path
      )

      await File.destroy({ where: { id: user.avatar_id } })
      await user.update({ avatar_id: null })

      unlink(imagePath, err => {
        if (err) {
          console.error('Não foi possivel remover a imagem', err)
        } else {
          console.log('Imagem removida: ', imagePath)
        }
      })

      return res.status(200).send()
    } catch (err) {
      console.error(err)
      return res.status(400).send({ error: 'Erro ao remover avatar' })
    }
  }
}

export default new UserController()
