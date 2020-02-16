import jwt from 'jsonwebtoken'
import User from '../models/User'

import authConfig from '../../config/auth'

export default async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization')

    if (!authHeader) {
      return res.status(401).send({ error: 'É necessário estar autenticado' })
    }

    const token = authHeader.replace('Bearer ', '')

    const decoded = await jwt.verify(token, authConfig.secret)

    const user = await User.findByPk(decoded.id, { include: ['avatar'] })

    if (!user) {
      throw new Error()
    }

    req.userId = user.id
    req.user = user

    return next()
  } catch (err) {
    return res.status(401).send({ error: 'Falha na autenticação' })
  }
}
