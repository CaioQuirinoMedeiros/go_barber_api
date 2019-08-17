import * as Yup from 'yup';

import User from '../models/User';
import File from '../models/File';

class UserController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required('O nome é obrigatório'),
      email: Yup.string()
        .email('O email não é um email válido')
        .required('O email é obrigatório'),
      password: Yup.string()
        .min(6, 'A senha deve ter no mínimo 6 dígitos')
        .required('A senha é obrigatória'),
      passwordConfirmation: Yup.string().when('password', (password, field) =>
        password
          ? field
              .required('É necessário confirmar a senha')
              .oneOf([Yup.ref('password')], 'As senhas não conferem')
          : field
      ),
    });

    try {
      await schema.validate(req.body);
    } catch (err) {
      return res.status(400).send({ error: err.message });
    }

    try {
      const userExists = await User.findByEmail(req.body.email);

      if (userExists) {
        return res.status(400).send({ error: 'Usuário já existe' });
      }

      const user = await User.create(req.body);

      const { id, name, email, provider } = user;

      return res.status(200).send({ id, name, email, provider });
    } catch (err) {
      return res.status(400).send({ error: 'Erro ao criar usuário' });
    }
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email('O email não é válido'),
      avatar_id: Yup.number(),
      oldPassword: Yup.string().when('password', (password, field) =>
        password ? field.required('É necessário fornecer a senha atual') : field
      ),
      password: Yup.string().min(6, 'A senha deve ter no mínimo 6 dígitos'),
      passwordConfirmation: Yup.string().when('password', (password, field) =>
        password
          ? field
              .required('É necessário confirmar a nova senha')
              .oneOf([Yup.ref('password')], 'As senhas não conferem')
          : field
      ),
    });

    const { email, oldPassword, password } = req.body;

    try {
      await schema.validate(req.body);
    } catch (err) {
      return res.status(400).send({ error: err.message });
    }

    try {
      let user = await User.findByPk(req.userId);

      if (email && email !== user.email) {
        const userExists = await User.findByEmail(email);

        if (userExists) {
          return res.status(400).send({ error: 'Usuário já existe' });
        }
      }

      if (password) {
        if (!oldPassword) {
          return res
            .status(401)
            .send({ error: 'Necessário fornecer senha atual' });
        }

        const passwordMatch = await user.checkPassword(oldPassword);

        if (!passwordMatch) {
          return res.status(401).send({ error: 'Senha inválida' });
        }
      }

      await user.update(req.body);

      user = await User.findByPk(user.id, {
        include: [{ model: File, as: 'avatar' }],
      });

      return res.status(200).send(user);
    } catch (err) {
      return res.status(400).send({ error: 'Erro ao editar usuário' });
    }
  }
}

export default new UserController();
