import * as Yup from 'yup';
import User from '../models/User';

class UserController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .min(6)
        .required(),
      passwordConfirmation: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    const isValid = await schema.isValid(req.body);

    if (!isValid) {
      return res.status(400).send({ error: 'Validation fails' });
    }

    try {
      const userExists = await User.findByEmail(req.body.email);

      if (userExists) {
        return res.status(400).send({ error: 'User already exists' });
      }

      const user = await User.create(req.body);

      const { id, name, email, provider } = user;

      return res.status(200).send({ id, name, email, provider });
    } catch (err) {
      return res.status(400).send({ error: 'Unable to create user' });
    }
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string(),
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      passwordConfirmation: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    const { email, oldPassword, password } = req.body;

    const isValid = await schema.isValid(req.body);

    if (!isValid) {
      return res.status(400).send({ error: 'Validation fails' });
    }

    try {
      let user = await User.findByPk(req.userId);

      if (email && email !== user.email) {
        const userExists = await User.findByEmail(email);

        if (userExists) {
          return res.status(400).send({ error: 'User already exists' });
        }
      }

      if (password) {
        if (!oldPassword) {
          return res.status(401).send({ error: 'Must provide old password' });
        }

        const passwordMatch = await user.checkPassword(oldPassword);

        if (!passwordMatch) {
          return res.status(401).send({ error: 'Invalid password' });
        }
      }

      user = await user.update(req.body);

      return res.status(200).send(user);
    } catch (err) {
      console.log(err);
      return res.status(400).send({ error: 'Unable to update user' });
    }
  }
}

export default new UserController();
