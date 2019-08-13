import User from '../models/User';

class UserController {
  async store(req, res) {
    const userExists = await User.findOne({ where: { email: req.body.email } });

    if (userExists) {
      return res.status(400).send({ error: 'User already exists' });
    }

    const user = await User.create(req.body);

    const { id, name, email, provider } = user;

    return res.status(200).send({ id, name, email, provider });
  }
}

export default new UserController();
