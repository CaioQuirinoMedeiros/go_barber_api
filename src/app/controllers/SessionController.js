import User from '../models/User';

class SessionController {
  async store(req, res) {
    const { email, password } = req.body;

    try {
      const user = await User.findOne({ where: { email } });

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
