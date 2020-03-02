// Requires
var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');

// Importar rutas
var appRoutes = require('./routes/app');
var usuarioRoutes = require('./routes/usuario');
var loginRoutes = require('./routes/login');


// Inicializar variables
var app = express();

// Body-parser configuración
app.use(bodyParser.urlencoded({ extended: false}))
app.use(bodyParser.json());

// Conexión a la base de datos
mongoose.connect('mongodb://localhost:27017/hospital', {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    })
    .then(() => console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online'))
    .catch(err => {
    console.log('Error en conexión: '+err);
    });
mongoose.set('useCreateIndex', true)


// Rutas
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);


// Escuchar peticiones express
app.listen(3000, () => {
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', 'online');
})