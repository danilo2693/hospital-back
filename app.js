// Requires
let express = require('express');
let mongoose = require('mongoose');
let bodyParser = require('body-parser');

// Importar rutas
let appRoutes = require('./routes/app');
let usuarioRoutes = require('./routes/usuario');
let loginRoutes = require('./routes/login');
let hospitalRoutes = require('./routes/hospital');
let medicoRoutes = require('./routes/medico');
let busquedaRoutes = require('./routes/busqueda');
let uploadRoutes = require('./routes/upload');
let imagenesRoutes = require('./routes/imagenes');
let contraseniaRoutes = require('./routes/contrasenia');


// Inicializar variables
let app = express();

// CORS
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*'); // update to match the domain you will make the request from
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', "POST, GET, PUT, DELETE, OPTIONS");
  next();
});

// Body-parser configuración
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Conexión a la base de datos
mongoose
  .connect('mongodb://localhost:27017/hospital', {
    useUnifiedTopology: true,
    useNewUrlParser: true
  })
  .then(() => console.log('Base de datos: \x1b[32m%s\x1b[0m', 'online'))
  .catch(err => {
    console.log('Error en conexión: ' + err);
  });
mongoose.set('useCreateIndex', true);

// Server index config
// let serverIndex = require('serve-index');
// app.use(express.static(__dirname+'/'));
// app.use('/uploads', serverIndex(__dirname + '/uploads'));

// Rutas
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);
app.use('/busqueda', busquedaRoutes);
app.use('/upload', uploadRoutes);
app.use('/imagen', imagenesRoutes);
app.use('/contrasenia', contraseniaRoutes);
app.use('/', appRoutes);

// Escuchar peticiones express
app.listen(3000, () => {
  console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', 'online');
});
