let express = require('express');
let app = express();

let Usuario = require('../models/usuario');
let Hospital = require('../models/hospital');
let Medico = require('../models/medico');

app.get('/todo/:busqueda', (req, res, next) => {
  let busqueda = req.params.busqueda;
  let regex = new RegExp(busqueda, 'i');
  Promise.all([buscarHospitales(regex), buscarMedicos(regex), buscarUsuario(regex)]).then(respuestas => {
    res.status(200).json({
      ok: true,
      hospitales: respuestas[0],
      medicos: respuestas[1],
      usuarios: respuestas[2]
    });
  });
});

app.get('/coleccion/:tabla/:busqueda', (req, res, next) => {
  let tabla = req.params.tabla;
  let busqueda = req.params.busqueda;
  let regex = new RegExp(busqueda, 'i');
  const USUARIOS = 'usuario';
  const HOSPITAL = 'hospital';
  const MEDICO = 'medico';
  let promesa;
  switch (tabla) {
    case USUARIOS:
      promesa = buscarUsuario(regex);
      break;
    case HOSPITAL:
      promesa = buscarHospitales(regex);
      break;
    case MEDICO:
      promesa = buscarMedicos(regex);
      break;
    default:
      return res.status(400).json({
        ok: false,
        mensaje: 'ErrorFindTypes',
        error: { mensaje: 'ErrorFindTypes' }
      });
  }
  promesa.then(respuestas => {
    res.status(200).json({
      ok: true,
      [tabla]: respuestas,
      total: respuestas.length
    });
  });
});

function buscarHospitales(regex) {
  return new Promise((resolve, reject) => {
    Hospital.find({ nombre: regex })
      .populate({ path: 'usuario', select: 'nombre email', model: Usuario })
      .exec((err, hospitales) => {
        if (err) {
          reject('Error al cargar hospitales', err);
        } else {
          resolve(hospitales);
        }
      });
  });
}

function buscarMedicos(regex) {
  return new Promise((resolve, reject) => {
    Medico.find({ nombre: regex })
      .populate({ path: 'usuario', select: 'nombre email', model: Usuario })
      .populate({ path: 'hospital', model: Hospital })
      .exec((err, medicos) => {
        if (err) {
          reject('Error al cargar medicos', err);
        } else {
          resolve(medicos);
        }
      });
  });
}

function buscarUsuario(regex) {
  return new Promise((resolve, reject) => {
    Usuario.find({}, 'nombre email img role google')
      .or([{ nombre: regex }, { email: regex }])
      .exec((err, usuarios) => {
        if (err) {
          reject('Error al cargar usuarios', err);
        } else {
          resolve(usuarios);
        }
      });
  });
}

module.exports = app;
