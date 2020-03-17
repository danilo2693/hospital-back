let jwt = require('jsonwebtoken');
let SEED = require('../config/config').SEED;

// Verificar token

exports.verificarToken = function(req, res, next) {
  let token = req.query.token;
  jwt.verify(token, SEED, (err, decoded) => {
    if (err) {
      return res.status(401).json({
        ok: false,
        mensaje: 'ErrorToken',
        errors: err
      });
    }
    req.usuario = decoded.usuario;
    next();
  });
};

// Verificar token

exports.verificarAdminRole = function(req, res, next) {
  let usuario = req.usuario;
  if (usuario.role === 'ADMIN_ROLE') {
    next();
  } else {
    return res.status(401).json({
      ok: false,
      mensaje: 'ErrorToken',
    });
  }
};

// Verificar token

exports.verificarAdminRoleOMismoUsuario = function(req, res, next) {
  let usuario = req.usuario;
  let id = req.params.id;
  if (usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
    next();
  } else {
    return res.status(401).json({
      ok: false,
      mensaje: 'ErrorToken',
    });
  }
};
