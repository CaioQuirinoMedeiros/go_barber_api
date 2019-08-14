import Notification from '../schemas/Notification';
import User from '../models/User';

class NotificationController {
  async index(req, res) {
    try {
      const provider = await User.findProvider(req.userId);

      if (!provider) {
        return res
          .status(400)
          .send({ error: 'Only providers can load notifications' });
      }

      const notifications = await Notification.find({ user: req.userId })
        .sort('-createdAt')
        .limit(20);

      return res.status(200).send(notifications);
    } catch (err) {
      return res.status(400).send({ error: 'Unable to get notifications' });
    }
  }
}

export default new NotificationController();
