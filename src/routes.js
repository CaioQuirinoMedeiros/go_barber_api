import { Router } from 'express';

import User from './app/models/User';

const routes = new Router();

routes.get('/', async (req, res) => {
  const user = await User.create({
    name: 'Caio',
    email: 'caio2@gmail.com',
    password_hash: '123123123',
  });

  return res.send(user);
});

export default routes;
