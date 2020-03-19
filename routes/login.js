let express = require('express');
let bcrypt = require('bcryptjs');
let jwt = require('jsonwebtoken');
let app = express();

let SEED = require('../config/config').SEED;

let Usuario = require('../models/usuario');

let CLIENT_ID = require('../config/config').CLIENT_ID;
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

async function verify(token) {
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: CLIENT_ID // Specify the CLIENT_ID of the app that accesses the backend
    // Or, if multiple clients access the backend:
    //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const payload = ticket.getPayload();
  // const userid = payload['sub'];
  // If request specified a G Suite domain:
  //const domain = payload['hd'];
  return {
    nombre: payload.name,
    email: payload.email,
    img: payload.picture,
    google: true
  };
}

let mdAutenticacion = require('../middlewares/autenticacion');

app.get('/renovar-token', mdAutenticacion.verificarToken, (req, res) => {
  let token = jwt.sign({ usuario: req.usuario }, SEED, { expiresIn: 14400 });
  res.status(200).json({
    ok: true,
    token
  });
});

app.post('/google', async (req, res) => {
  let token = req.body.token;
  let googleUser = await verify(token).catch(error => {
    return res.status(403).json({
      ok: false,
      mensaje: 'InvalidToken',
      errors: error
    });
  });
  Usuario.findOne({ email: googleUser.email }, (err, usuarioDb) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'ErrorFindUser',
        errors: err
      });
    } else if (usuarioDb) {
      if (usuarioDb.google) {
        usuarioDb.password = '';
        let normalToken = jwt.sign({ usuario: usuarioDb }, SEED, { expiresIn: 14400 });
        return res.status(200).json({
          ok: true,
          usuario: usuarioDb,
          token: normalToken,
          id: usuarioDb._id,
          menu: obtenerMenu(usuarioDb.role)
        });
      }
    } else {
      // Hay que crear el usuario
      let usuario = new Usuario();
      usuario.nombre = googleUser.nombre;
      usuario.email = googleUser.email;
      usuario.img = googleUser.img;
      usuario.google = true;
      usuario.password = ':)';
      usuario.save((errorCreacion, usuarioCreado) => {
        if (errorCreacion) {
          return res.status(400).json({
            ok: false,
            mensaje: 'ErrorCreateUser',
            errors: errorCreacion
          });
        } else {
          usuarioCreado.password = '';
          let normalToken = jwt.sign({ usuario: usuarioCreado }, SEED, { expiresIn: 14400 });
          return res.status(200).json({
            ok: true,
            usuario: usuarioCreado,
            token: normalToken,
            id: usuarioCreado._id,
            menu: obtenerMenu(usuarioCreado.role)
          });
        }
      });
    }
  });
});

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
        mensaje: 'ErrorCredentials'
      });
    } else {
      usuarioDb.password = '';
      let token = jwt.sign({ usuario: usuarioDb }, SEED, { expiresIn: 14400 });
      res.status(200).json({
        ok: true,
        usuario: usuarioDb,
        token,
        id: usuarioDb._id,
        menu: obtenerMenu(usuarioDb.role)
      });
    }
  });
});

function obtenerMenu(role) {
  var menu = [
    {
      titulo: 'Main',
      icono: 'mdi mdi-gauge',
      submenu: [
        { subtitulo: 'Dashboard', url: '/dashboard' },
        { subtitulo: 'ProgressBar', url: '/progress' },
        { subtitulo: 'Promises', url: '/promesas' },
        { subtitulo: 'Rxjs', url: '/rxjs' }
      ]
    },
    {
      titulo: 'Maintenance',
      icono: 'mdi mdi-folder-lock-open',
      submenu: [
        { subtitulo: 'Hospitals', url: '/maintenance/hospitals' },
        { subtitulo: 'Doctors', url: '/maintenance/doctors' }
      ]
    }
  ];

  if (role === 'ADMIN_ROLE') {
    menu[1].submenu.unshift({ subtitulo: 'Users', url: '/maintenance/users' });
  }
  return menu;
}

module.exports = app;
