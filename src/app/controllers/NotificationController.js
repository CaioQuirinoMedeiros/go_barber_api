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

  async update(req, res) {
    const { id } = req.params;

    try {
      const notification = await Notification.findByIdAndUpdate(
        id,
        { read: true },
        { new: true }
      );

      if (!notification) {
        return res.status(404).send({ error: 'Notification not found' });
      }

      return res.status(200).send(notification);
    } catch (err) {
      return res.status(400).send({ error: 'Unable to update notification' });
    }
  }
}

export default new NotificationController();
