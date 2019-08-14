import File from '../models/File';

class FileController {
  async store(req, res) {
    const { originalname, filename } = req.file;

    try {
      const file = await File.create({ name: originalname, path: filename });

      return res.status(201).send(file);
    } catch (err) {
      return res.status(400).send({ error: 'Unable to save the image' });
    }
  }
}

export default new FileController();
