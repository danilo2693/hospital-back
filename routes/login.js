var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var app = express();

var SEED = require('../config/config').SEED;

var Usuario = require('../models/usuario');

app.post('/', (req, res) => {
  var body = req.body;
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
      var token = jwt.sign({ usuario: usuarioDb }, SEED, { expiresIn: 14400 });
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
