var express = require('express');
var bcrypt = require('bcryptjs');
var mdVerificarToken = require('../middlewares/autenticacion');
var app = express();

var Usuario = require('../models/usuario');

// Obtener todos los usuarios
app.get('/', (req, res, next) => {
  Usuario.find({}, 'nombre email img role').exec((err, usuarios) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'ErrorFindUser',
        errors: err
      });
    } else {
      res.status(200).json({
        ok: true,
        usuarios
      });
    }
  });
});

// Crear usuario
app.post('/', mdVerificarToken.verificarToken, (req, res) => {
  var body = req.body;
  var usuario = new Usuario({
    nombre: body.nombre,
    email: body.email,
    password: bcrypt.hashSync(body.password, 10),
    img: body.img,
    role: body.role
  });

  usuario.save((err, usuarioBd) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'ErrorCreateUser',
        errors: err
      });
    } else {
      res.status(201).json({
        ok: true,
        usuarios: usuarioBd,
        usuarioToken: req.usuario
      });
    }
  });
});

// Actualizar usuario
app.put('/:id', mdVerificarToken.verificarToken, (req, res) => {
  var id = req.params.id;
  Usuario.findById(id, (err, usuario) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'ErrorFindUser',
        errors: err
      });
    } else if (!usuario) {
      return res.status(404).json({
        ok: false,
        mensaje: 'ErrorNotFoundUser',
        errors: { message: 'ErrorNotFoundUser' }
      });
    } else {
      var body = req.body;
      usuario.nombre = body.nombre;
      usuario.email = body.email;
      usuario.role = body.role;
      usuario.save((errorCreate, usuarioBd) => {
        if (errorCreate) {
          return res.status(400).json({
            ok: false,
            mensaje: 'ErrorUpdateUser',
            errors: errorCreate
          });
        } else {
          usuarioBd.password = '';
          return res.status(200).json({
            ok: true,
            usuarioBd
          });
        }
      });
    }
  });
});

app.delete('/:id', mdVerificarToken.verificarToken, (req, res) => {
  var id = req.params.id;
  Usuario.findByIdAndDelete(id, (err, usuarioEliminado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'ErrorDeleteUser',
        errors: err
      });
    } else if (!usuarioEliminado) {
      return res.status(404).json({
        ok: false,
        mensaje: 'ErrorNotFoundUser',
        errors: { message: 'ErrorNotFoundUser' }
      });
    } else {
      usuarioEliminado.password = '';
      return res.status(200).json({
        ok: true,
        usuario: usuarioEliminado
      });
    }
  });
});

module.exports = app;
