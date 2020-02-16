import { Router } from 'express'
import multer from 'multer'

import multerConfig from './config/multer'

import UserController from './app/controllers/UserController'
import SessionController from './app/controllers/SessionController'
import FileController from './app/controllers/FileController'
import ProviderController from './app/controllers/ProviderController'
import AppointmentController from './app/controllers/AppointmentController'
import NotificationController from './app/controllers/NotificationController'
import ScheduleController from './app/controllers/ScheduleController'
import AvailableController from './app/controllers/AvailableController'

import AuthMiddleware from './app/middlewares/auth'

import validateUserStore from './app/validators/UserStore'
import validateUserUpdate from './app/validators/UserUpdate'
import validateAppointmentStore from './app/validators/AppointmentStore'
import validateSessionStore from './app/validators/SessionStore'

const routes = new Router()
const upload = multer(multerConfig)

routes.post('/users', validateUserStore, UserController.store)
routes.post('/sessions', validateSessionStore, SessionController.store)

routes.use(AuthMiddleware)

routes.put('/users', validateUserUpdate, UserController.update)
routes.delete('/users/avatar', UserController.removeAvatar)

routes.get('/providers', ProviderController.index)
routes.get('/providers/:id/available', AvailableController.index)

routes.post(
  '/appointments',
  validateAppointmentStore,
  AppointmentController.store
)
routes.get('/appointments', AppointmentController.index)
routes.delete('/appointments/:id', AppointmentController.delete)

routes.get('/schedule', ScheduleController.index)

routes.get('/notifications', NotificationController.index)
routes.put('/notifications/:id', NotificationController.update)

routes.post('/files', upload.single('file'), FileController.store)

routes.use((req, res) => res.status(400).send({ error: 'Nothing around here' }))

export default routes
