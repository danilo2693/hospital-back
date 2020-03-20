let express = require('express');
let mdVerificarToken = require('../middlewares/autenticacion');
let app = express();

let Usuario = require('../models/usuario');
let Hospital = require('../models/hospital');
let Medico = require('../models/medico');

// Obtener todos los medicos
app.get('/', (req, res, next) => {
  let desde = req.query.desde || 0;
  desde = Number(desde);
  Medico.find({})
    .skip(desde)
    .limit(5)
    .populate({ path: 'usuario', select: 'nombre email', model: Usuario })
    .populate({ path: 'hospital', model: Hospital })
    .exec((err, medicos) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'ErrorFindDoctor',
          errors: err
        });
      } else {
        Medico.countDocuments({}, (errorConteo, conteo) => {
          res.status(200).json({
            ok: true,
            medicos,
            total: conteo
          });
        });
      }
    });
});

// Obtener medico por id
app.get('/:id', (req, res, next) => {
  let id = req.params.id;
  Medico.findById(id)
    .populate({ path: 'usuario', select: 'nombre email', model: Usuario })
    .populate({
      path: 'hospital',
      model: Hospital,
      populate: { path: 'usuario', select: 'nombre email', model: Usuario }
    })
    .exec((err, medico) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'ErrorFindDoctor',
          errors: err
        });
      } else {
        res.status(200).json({
          ok: true,
          medico
        });
      }
    });
});

// Crear medico
app.post('/', mdVerificarToken.verificarToken, (req, res) => {
  let body = req.body;
  let medico = new Medico({
    nombre: body.nombre,
    img: body.img,
    usuario: req.usuario._id,
    hospital: body.hospital
  });

  medico.save((err, medicoDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'ErrorCreateDoctor',
        errors: err
      });
    } else {
      res.status(201).json({
        ok: true,
        medico: medicoDB,
        usuarioToken: req.usuario
      });
    }
  });
});

// Actualizar medico
app.put('/:id', mdVerificarToken.verificarToken, (req, res) => {
  let id = req.params.id;
  Medico.findById(id, (err, medico) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'ErrorFindDoctor',
        errors: err
      });
    } else if (!medico) {
      return res.status(404).json({
        ok: false,
        mensaje: 'ErrorNotFoundDoctor',
        errors: { mensaje: 'ErrorNotFoundDoctor' }
      });
    } else {
      let body = req.body;
      medico.nombre = body.nombre;
      medico.usuario = req.usuario._id;
      medico.hospital = body.hospital;
      medico.save((errorCreate, medicoBd) => {
        if (errorCreate) {
          return res.status(400).json({
            ok: false,
            mensaje: 'ErrorUpdateDoctor',
            errors: errorCreate
          });
        } else {
          return res.status(200).json({
            ok: true,
            medico: medicoBd
          });
        }
      });
    }
  });
});

app.delete('/:id', mdVerificarToken.verificarToken, (req, res) => {
  let id = req.params.id;
  Medico.findByIdAndDelete(id, (err, medicoEliminado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'ErrorDeleteDoctor',
        errors: err
      });
    } else if (!medicoEliminado) {
      return res.status(404).json({
        ok: false,
        mensaje: 'ErrorNotFoundDoctor',
        errors: { mensaje: 'ErrorNotFoundDoctor' }
      });
    } else {
      medicoEliminado.password = '';
      return res.status(200).json({
        ok: true,
        usuario: medicoEliminado
      });
    }
  });
});

module.exports = app;
