import sgMail from '@sendgrid/mail'

import mailConfig from '../config/mail'

class Mail {
  constructor() {
    this.sgMail = sgMail
    this.sgMail.setApiKey(mailConfig.apiKey)
  }

  async sendMail(message) {
    return this.sgMail.send({ ...mailConfig.default, ...message })
  }
}

export default new Mail()
