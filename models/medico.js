let mongoose = require('mongoose');
let Schema = mongoose.Schema;
let medicoSchema = new Schema({
  nombre: { type: String, required: [true, 'RequiredName'] },
  img: { type: String, required: false },
  usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
  hospital: { type: Schema.Types.ObjectId, ref: 'Hospital', required: [true, 'RequiredHospital'] }
});
module.exports = mongoose.model('Medico', medicoSchema);
