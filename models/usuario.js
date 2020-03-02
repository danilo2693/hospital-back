var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var rolesValidos = {
    values: ['USER_ROLE', 'ADMIN_ROLE'],
    message: '{VALUE} RolError'
}

var usuarioSchema = new Schema({
    nombre: { type: String, required: [true, 'NameRequired'] },
    email: { type: String, unique: true, required: [true, 'MailRequired'] },
    password: { type: String, required: [true, 'PasswordRequired'] },
    img: { type: String, required: false },
    role: { type: String, required: true, default: 'USER_ROLE', enum: rolesValidos }
});

usuarioSchema.plugin(uniqueValidator, {message: '{PATH} Unique'})

module.exports = mongoose.model('usuario', usuarioSchema);