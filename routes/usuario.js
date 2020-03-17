let express = require('express');
let bcrypt = require('bcryptjs');
let mdAutenticacion = require('../middlewares/autenticacion');
let app = express();

let Usuario = require('../models/usuario');
let Hospital = require('../models/hospital');

// Obtener todos los usuarios
app.get('/', (req, res, next) => {
  let desde = req.query.desde || 0;
  desde = Number(desde);
  Usuario.find({}, 'nombre email img role google')
    .skip(desde)
    .limit(5)
    .exec((err, usuarios) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'ErrorFindUser',
          errors: err
        });
      } else {
        Usuario.countDocuments({}, (errorConteo, conteo) => {
          res.status(200).json({
            ok: true,
            usuarios,
            total: conteo
          });
        });
      }
    });
});

// Obtener usuario por id
app.get('/:id', (req, res, next) => {
  let id = req.params.id;
  Usuario.findById(id, 'nombre email img role google').exec((err, usuario) => {
    if (err) {
      return res.status(400).json({
        ok: false,
        mensaje: 'ErrorFindUser',
        errors: err
      });
    } else {
      res.status(200).json({
        ok: true,
        usuario
      });
    }
  });
});

// Obtener hospitales por usuario id
app.get('/:id/hospitales', (req, res, next) => {
  let id = req.params.id;
  Usuario.findById(id).exec((error, usuario) => {
    Hospital.find({ usuario }, 'nombre').exec((err, hospitales) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'ErrorFindHospital',
          errors: err
        });
      } else {
        res.status(200).json({
          ok: true,
          hospitales
        });
      }
    });
  });
});

// Crear usuario
app.post('/:id', (req, res) => {
  let body = req.body;
  let usuario = new Usuario({
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
        usuario: usuarioBd,
        usuarioToken: req.usuario
      });
    }
  });
});

// Actualizar usuario
app.put('/:id', [mdAutenticacion.verificarToken, mdAutenticacion.verificarAdminRoleOMismoUsuario], (req, res) => {
  let id = req.params.id;
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
      let body = req.body;
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
            usuario: usuarioBd
          });
        }
      });
    }
  });
});

app.delete('/:id', [mdAutenticacion.verificarToken, mdAutenticacion.verificarAdminRole], (req, res) => {
  let id = req.params.id;
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
        errors: { message: 'ErrorNotFoundUser', usuarioEliminado }
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
