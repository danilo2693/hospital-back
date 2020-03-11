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
