let express = require('express');
const fileUpload = require('express-fileupload');
let fs = require('fs');
let app = express();

let Usuario = require('../models/usuario');
let Hospital = require('../models/hospital');
let Medico = require('../models/medico');

app.use(fileUpload());

app.put('/:tabla/:id', function(req, res) {
  let tabla = req.params.tabla;
  let id = req.params.id;
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).json({
      ok: false,
      mensaje: 'FileNotUpload',
      errors: 'FileNotUpload'
    });
  }

  let archivo = req.files.imagen;
  let extensionImagen = archivo.name.split('.').pop();

  let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];
  let tablasValidas = ['usuario', 'hospital', 'medico'];

  if (extensionesValidas.includes(extensionImagen.toLowerCase())) {
    if (tablasValidas.includes(tabla.toLocaleLowerCase())) {
      // Personalizar nombre imagen
      let nombreNuevo = `${id}-${Math.floor(
        Math.random() * 1000001
      )}${new Date().getMilliseconds()}.${extensionImagen}`;
      moverImagen(archivo, nombreNuevo, tabla, res);
      asignarImagen(tabla, id, nombreNuevo, res);
    } else {
      res.status(400).json({
        ok: false,
        mensaje: 'ErrorFindTypes',
        errors: 'ErrorFindTypes'
      });
    }
  } else {
    res.status(400).json({
      ok: false,
      mensaje: 'ExtensionValid' + ' ' + extensionesValidas.join(', '),
      errors: 'ExtensionNotValid'
    });
  }
});

function asignarImagen(tabla, id, nombreNuevo, res) {
  const USUARIOS = 'usuario';
  const HOSPITAL = 'hospital';
  const MEDICO = 'medico';
  switch (tabla) {
    case USUARIOS:
      Usuario.findById(id, (err, usuarioDB) => {
        if (err) {
          return res.status(404).json({
            ok: false,
            mensaje: 'ErrorUserNotFound',
            errors: { message: 'ErrorUserNotFound' }
          });
        } else {
          let pathImagenAnterior = './uploads/usuario/' + usuarioDB.img;
          eliminarImagenAnterior(pathImagenAnterior);
          usuarioDB.img = nombreNuevo;
          usuarioDB.save((errorActualizar, usuarioDbActualizado) => {
            usuarioDbActualizado.password = '';
            return res.status(200).json({
              ok: true,
              mensaje: 'ExitUserUpdate',
              usuarioDbActualizado
            });
          });
        }
      });
      break;
    case HOSPITAL:
      Hospital.findById(id, (err, hospitalDb) => {
        if (err) {
          return res.status(404).json({
            ok: false,
            mensaje: 'ErrorHospitalNotFound',
            errors: { message: 'ErrorHospitalNotFound' }
          });
        } else {
          var pathImagenAnterior = `./uploads/hospital/${hospitalDb.img}`;
          eliminarImagenAnterior(pathImagenAnterior);
          hospitalDb.img = nombreNuevo;
          hospitalDb.save((errorActualizar, hospitalDbActualizado) => {
            return res.status(200).json({
              ok: true,
              mensaje: 'ExitHospitalUpdate',
              hospitalDbActualizado
            });
          });
        }
      });
      break;
    case MEDICO:
      Medico.findById(id, (err, medicoDb) => {
        if (err) {
          return res.status(404).json({
            ok: false,
            mensaje: 'ErrorMedicoNotFound',
            errors: { message: 'ErrorMedicoNotFound' }
          });
        } else {
          var pathImagenAnterior = `./uploads/medico/${medicoDb.img}`;
          eliminarImagenAnterior(pathImagenAnterior);
          medicoDb.img = nombreNuevo;
          medicoDb.save((errorActualizar, medicoDbActualizado) => {
            return res.status(200).json({
              ok: true,
              mensaje: 'ExitMedicoUpdate',
              medicoDbActualizado
            });
          });
        }
      });
      break;
    default:
      return res.status(400).json({
        ok: false,
        mensaje: 'ErrorFindTypes',
        error: { mensaje: 'ErrorFindTypes' }
      });
  }
}

function eliminarImagenAnterior(pathImagenAnterior) {
  if (fs.existsSync(pathImagenAnterior)) {
    return fs.unlinkSync(pathImagenAnterior);
  }
}

function moverImagen(archivo, nombreNuevo, tabla, res) {
  let path = `./uploads/${tabla}/${nombreNuevo}`;
  archivo.mv(path, function(err) {
    if (err) {
      res.status(500).json({
        ok: false,
        mensaje: '',
        errors: 'ErrorMoveImage'
      });
    }
  });
}

module.exports = app;
