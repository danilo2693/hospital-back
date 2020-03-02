let express = require('express');
let bcrypt = require('bcryptjs');
let jwt = require('jsonwebtoken');
let app = express();

let SEED = require('../config/config').SEED;

let Usuario = require('../models/usuario');

app.post('/', (req, res) => {
  let body = req.body;
  Usuario.findOne({ email: body.email }, (err, usuarioDb) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'ErrorFindUser',
        errors: err
      });
    } else if (!usuarioDb) {
      return res.status(401).json({
        ok: false,
        mensaje: 'ErrorCredentials',
        errors: err
      });
    } else if (!bcrypt.compareSync(body.password, usuarioDb.password)) {
      return res.status(401).json({
        ok: false,
        mensaje: 'ErrorCredentials',
        errors: err
      });
    } else {
      usuarioDb.password = '';
      let token = jwt.sign({ usuario: usuarioDb }, SEED, { expiresIn: 14400 });
      res.status(200).json({
        ok: true,
        usuario: usuarioDb,
        token,
        id: usuarioDb._id
      });
    }
  });
});

module.exports = app;
