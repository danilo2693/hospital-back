let nodemailer = require('nodemailer');
let GMAIL_SERVICE_NAME = require('../config/config').GMAIL_SERVICE_NAME;
let GMAIL_SERVICE_HOST = require('../config/config').GMAIL_SERVICE_HOST;
let GMAIL_SERVICE_SECURE = require('../config/config').GMAIL_SERVICE_SECURE;
let GMAIL_SERVICE_PORT = require('../config/config').GMAIL_SERVICE_PORT;
let GMAIL_USER_NAME = require('../config/config').GMAIL_USER_NAME;
let GMAIL_USER_PASSWORD = require('../config/config').GMAIL_USER_PASSWORD;

module.exports.GmailTransport = nodemailer.createTransport({
  service: GMAIL_SERVICE_NAME,
  host: GMAIL_SERVICE_HOST,
  secure: GMAIL_SERVICE_SECURE,
  port: GMAIL_SERVICE_PORT,
  auth: {
    user: GMAIL_USER_NAME,
    pass: GMAIL_USER_PASSWORD
  }
});

module.exports.ViewOption = (transport, hbs) => {
  transport.use(
    'compile',
    hbs({
        viewEngine: {
          extName: '.hbs',
          partialsDir: 'config/templates',
          layoutsDir: 'config/templates',
          defaultLayout: '',
        },
        viewPath: 'config/templates',
        extName: '.hbs',
      })
  );
};
