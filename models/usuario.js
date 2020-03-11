let mongoose = require('mongoose');
let uniqueValidator = require('mongoose-unique-validator');

let Schema = mongoose.Schema;

let rolesValidos = {
    values: ['USER_ROLE', 'ADMIN_ROLE'],
    message: '{VALUE} RolError'
}

let usuarioSchema = new Schema({
    nombre: { type: String, required: [true, 'NameRequired'] },
    email: { type: String, unique: true, required: [true, 'MailRequired'] },
    password: { type: String, required: [true, 'PasswordRequired'] },
    img: { type: String, required: false },
    role: { type: String, required: true, default: 'USER_ROLE', enum: rolesValidos },
    google: { type: Boolean, default: false }
});

usuarioSchema.plugin(uniqueValidator, {message: '{PATH} Unique'})

module.exports = mongoose.model('usuario', usuarioSchema);