const { Router } = require("express");

const routes = new Router();

routes.get("/", (req, res) => {
  res.send("olá");
});

module.exports = routes;
