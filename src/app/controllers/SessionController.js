import * as Yup from 'yup';

import User from '../models/User';
import File from '../models/File';

class SessionController {
  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string()
        .email('Não é um email válido')
        .required('Forneça seu email'),
      password: Yup.string().required('Forneça sua senha secreta'),
    });

    const { email, password } = req.body;

    try {
      await schema.validate(req.body);
    } catch (err) {
      return res.status(400).send({ error: err.message });
    }

    try {
      const user = await User.findOne({
        where: { email },
        include: [
          { model: File, as: 'avatar', attributes: ['id', 'path', 'url'] },
        ],
      });

      if (!user) {
        return res.status(404).send({ error: 'Usuário não encontrado' });
      }

      const passwordMatch = await user.checkPassword(password);

      if (!passwordMatch) {
        return res.status(401).send({ error: 'Senha inválida' });
      }

      const token = await user.generateJWT();

      return res.status(201).send({ user, token });
    } catch (err) {
      return res.status(400).send({ error: 'Erro ao se autenticar' });
    }
  }
}

export default new SessionController();
