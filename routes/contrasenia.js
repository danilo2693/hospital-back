let express = require('express');
let bcrypt = require('bcryptjs');
const crypto = require('crypto');
let app = express();

let CLIENT_URL = require('../config/config').CLIENT_URL;
let GMAIL_NAME = require('../config/config').GMAIL_NAME;
let GMAIL_USER_NAME = require('../config/config').GMAIL_USER_NAME;

let MailConfig = require('../config/email');
let hbs = require('nodemailer-express-handlebars');
let gmailTransport = MailConfig.GmailTransport;

let Usuario = require('../models/usuario');
let PasswordResetToken = require('../models/reset-token');

app.post('/recuperar', (req, res) => {
  let body = req.body;
  if (!body.email) {
    return res.status(500).json({ mensaje: 'EmailRequired' });
  }
  Usuario.findOne({ email: body.email }, (err, usuario) => {
    if (err) {
      return res.status(500).json({
        ok: false,
        mensaje: 'ErrorFindUser',
        errors: err
      });
    } else if (!usuario) {
      return res.status(404).json({
        ok: false,
        mensaje: 'ErrorUserNotFound',
        errors: { mensaje: 'ErrorUserNotFound' }
      });
    } else {
      var resetToken = new PasswordResetToken({
        _userId: usuario._id,
        resetToken: crypto.randomBytes(16).toString('hex')
      });
      resetToken.save((error, resetTokenDb) => {
        if (error) {
          return res.status(500).send({ ok: false, mensaje: 'RecoveryPasswordError', errors: error });
        }
        PasswordResetToken.find({ _userId: usuario._id, resetToken: { $ne: resetToken.resetToken } })
          .deleteOne()
          .exec();
        res.status(200).json({ ok: true, mensaje: 'RecoveryPasswordSuccessfully' });

        MailConfig.ViewOption(gmailTransport, hbs);
        let HelperOptions = {
          from: '"'+ GMAIL_NAME +'" <'+ GMAIL_USER_NAME + ">",
          to: usuario.email,
          subject: 'Recuperación de contraseña',
          template: 'recovery-password-email',
          context: {
            name: usuario.nombre,
            email: usuario.email,
            url: CLIENT_URL,
            resetToken: resetToken.resetToken
          }
        };
        gmailTransport.sendMail(HelperOptions, (errorSendEmail, info) => {
          if (errorSendEmail) {
            res.json(errorSendEmail);
          }
          res.json(info);
        });
      });
    }
  });
});

app.get('/verificar-token/:resetToken', (req, res) => {
  let resetToken = req.params.resetToken;
  if (!resetToken) {
    return res.status(500).json({ mensaje: 'TokenRequired' });
  }
  PasswordResetToken.findOne(
    {
      resetToken
    },
    (err, resetTokenDb) => {
      if (err) {
        return res.status(500).json({
          ok: false,
          mensaje: 'InvalidUrl',
          errors: err
        });
      } else if (!resetTokenDb) {
        return res.status(404).json({
          ok: false,
          mensaje: 'InvalidUrl',
          errors: { mensaje: 'InvalidUrl' }
        });
      } else {
        Usuario.findOne({ _id: resetTokenDb._userId })
          .then(() => {
            res.status(200).json({ ok: true, mensaje: 'TokenVerifiedSuccessfully' });
          })
          .catch(error => {
            return res.status(500).send({ ok: false, mensaje: 'InvalidUrl', errors: error });
          });
      }
    }
  );
});

app.put('/nueva-contrasenia', (req, res) => {
  let body = req.body;
  if (!body.resetToken) {
    return res.status(500).json({ mensaje: 'TokenRequired' });
  }
  PasswordResetToken.findOne(
    {
      resetToken: body.resetToken
    },
    (err, resetTokenDb) => {
      if (!resetTokenDb) {
        return res.status(409).json({ mensaje: 'TokenHasExpired' });
      }
      Usuario.findOne(
        {
          _id: resetTokenDb._userId
        },
        (errorUser, usuarioDb, next) => {
          if (!usuarioDb) {
            return res.status(404).json({ mensaje: 'ErrorUserNotFound' });
          }
          return bcrypt.hash(body.password, 10, (errorPassword, nuevaContrasenia) => {
            if (errorPassword) {
              return res.status(400).json({ mensaje: 'ErrorHashingPassword' });
            }
            usuarioDb.password = nuevaContrasenia;
            usuarioDb.save((errorCreate, usuarioUpdate) => {
              if (errorCreate) {
                return res.status(400).json({
                  ok: false,
                  mensaje: 'PasswordCanNotReset',
                  errors: errorCreate
                });
              } else {
                usuarioUpdate.password = '';
                return res.status(200).json({
                  ok: true,
                  mensaje: 'PasswordResetSuccessfully',
                  usuario: usuarioUpdate
                });
              }
            });
          });
        }
      );
    }
  );
});

module.exports = app;
