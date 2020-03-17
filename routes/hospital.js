let express = require('express');
let mdVerificarToken = require('../middlewares/autenticacion');
let app = express();

let Hospital = require('../models/hospital');
let Usuario = require('../models/usuario');

// Obtener todos los hospitales
app.get('/', (req, res, next) => {
  let desde = req.query.desde || 0;
  desde = Number(desde);
  Hospital.find({})
    .skip(desde)
    .limit(5)
    .populate({ path: 'usuario', select: 'nombre email', model: Usuario })
    .exec((err, hospitales) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'ErrorFindHospital',
          errors: err
        });
      } else {
        Hospital.countDocuments({}, (errorConteo, conteo) => {
          res.status(200).json({
            ok: true,
            hospitales,
            total: conteo
          });
        });
      }
    });
});

// Obtener hospital por id
app.get('/:id', (req, res, next) => {
  let id = req.params.id;
  Hospital.findById(id)
    .populate({ path: 'usuario', select: 'nombre email', model: Usuario })
    .exec((err, hospital) => {
      if (err) {
        return res.status(400).json({
          ok: false,
          mensaje: 'ErrorFindHospital',
          errors: err
        });
      } else {
        res.status(200).json({
          ok: true,
          hospital
        });
      }
    });
});

// Crear hospital
app.post('/', mdVerificarToken.verificarToken, (req, res) => {
  let body = req.body;
  let hospital = new Hospital({
    nombre: body.nombre,
    usuario: req.usuario._id
  });

  hospital.save((err, hospitalDB) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'ErrorCreateHospital',
        errors: err
      });
    } else {
      res.status(201).json({
        ok: true,
        hospital: hospitalDB,
        usuarioToken: req.usuario._id
      });
    }
  });
});

// Actualizar hospital
app.put('/:id', mdVerificarToken.verificarToken, (req, res) => {
  let id = req.params.id;
  Hospital.findById(id, (err, hospital) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'ErrorFindHospital',
        errors: err
      });
    } else if (!hospital) {
      return res.status(404).json({
        ok: false,
        mensaje: 'ErrorNotFoundHospital',
        errors: { message: 'ErrorNotFoundHospital' }
      });
    } else {
      let body = req.body;
      hospital.nombre = body.nombre;
      hospital.usuario = req.usuario._id;
      hospital.save((errorCreate, hospitalBd) => {
        if (errorCreate) {
          return res.status(400).json({
            ok: false,
            mensaje: 'ErrorUpdateHospital',
            errors: errorCreate
          });
        } else {
          return res.status(200).json({
            ok: true,
            hospital: hospitalBd
          });
        }
      });
    }
  });
});

app.delete('/:id', mdVerificarToken.verificarToken, (req, res) => {
  let id = req.params.id;
  Hospital.findByIdAndDelete(id, (err, hospitalEliminado) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'ErrorDeleteHospital',
        errors: err
      });
    } else if (!hospitalEliminado) {
      return res.status(404).json({
        ok: false,
        mensaje: 'ErrorNotFoundHospital',
        errors: { message: 'ErrorNotFoundHospital' }
      });
    } else {
      hospitalEliminado.password = '';
      return res.status(200).json({
        ok: true,
        usuario: hospitalEliminado
      });
    }
  });
});

module.exports = app;
