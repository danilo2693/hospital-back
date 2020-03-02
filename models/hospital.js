let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let hospitalSchema = new Schema(
  {
    nombre: { type: String, required: [true, 'RequiredName'] },
    img: { type: String, required: false },
    usuario: { type: Schema.Types.ObjectId, ref: 'Usuario' }
  },
  { collection: 'hospitales' }
);
module.exports = mongoose.model('Hospital', hospitalSchema);
