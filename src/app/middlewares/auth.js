import jwt from 'jsonwebtoken';
import User from '../models/User';

import authConfig from '../../config/auth';

export default async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader) {
      return res.status(401).send({ error: 'No token provided' });
    }

    const token = authHeader.replace('Bearer ', '');

    const decoded = await jwt.verify(token, authConfig.secret);

    const user = await User.findByPk(decoded.id);

    if (!user) {
      throw new Error();
    }

    req.userId = user.id;

    return next();
  } catch (err) {
    return res.status(401).send({ error: 'Invalid token' });
  }
};