import 'dotenv/config'
import 'express-async-errors'
import cors from 'cors'
import express from 'express'
import Youch from 'youch'
import path from 'path'

import routes from './routes'
import './database'

class App {
  constructor() {
    this.server = express()

    this.middlewares()
    this.routes()
    this.exeptionHandler()
  }

  middlewares() {
    this.server.use(cors())
    this.server.use(express.json())
    this.server.use(
      '/files',
      express.static(path.resolve(__dirname, '..', 'tmp', 'uploads'))
    )
  }

  routes() {
    this.server.use(routes)
  }

  exeptionHandler() {
    this.server.use(async (err, req, res, next) => {
      if (process.env.NODE_ENV === 'development') {
        const errors = await new Youch(err, req).toJSON()

        return res.status(500).send(errors)
      }

      return res.status(500).send({ error: 'Erro interno do servidor' })
    })
  }
}

export default new App().server
