import File from '../models/File';

class FileController {
  async store(req, res) {
    const { originalname, filename } = req.file;
    console.log('CHEGOU AQUI');

    try {
      const file = await File.create({ name: originalname, path: filename });
      console.log('CHEGOU AQUI 2');

      return res.status(201).send(file);
    } catch (err) {
      console.log('CHEGOU AQUI 3', err);
      return res.status(400).send({ error: 'Erro ao salvar imagem' });
    }
  }
}

export default new FileController();
