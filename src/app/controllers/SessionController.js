import * as Yup from 'yup';

import User from '../models/User';
import File from '../models/File';

class SessionController {
  async store(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string().required(),
    });

    const { email, password } = req.body;

    const isValid = await schema.isValid(req.body);

    if (!isValid) {
      return res.status(400).send({ error: 'Validation fails' });
    }

    try {
      const user = await User.findOne({
        where: { email },
        include: [
          { model: File, as: 'avatar', attributes: ['id', 'path', 'url'] },
        ],
      });

      if (!user) {
        return res.status(404).send({ error: 'User not found' });
      }

      const passwordMatch = await user.checkPassword(password);

      if (!passwordMatch) {
        return res.status(401).send({ error: 'Invalid password' });
      }

      const token = await user.generateJWT();

      return res.status(201).send({ user, token });
    } catch (err) {
      return res
        .status(400)
        .send({ error: err.message || 'Invalid credentials' });
    }
  }
}

export default new SessionController();
