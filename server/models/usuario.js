const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

// Creo el esquema en MongoDB
let Schema = mongoose.Schema;

let rolesValidos = {
	values: ['ADMIN_ROLE', 'USER_ROLE'],
	message: '{VALUE} no es un rol válido'
};

let usuarioSchema = new Schema({
	nombre: {
		type: String,
		required: [true, 'El nombre es obligatorio']
	},
	apellido: {
		type: String,
		required: [true, 'El apellido es obligatorio']
	},
	email: {
		type: String,
		unique: true,
		required: [true, 'El correo es obligatorio']
	},
	password: {
		type: String,
		required: [true, 'La contraseña es obligatoria']
	},
	role: {
		type: String,
		default: 'USER_ROLE',
		enum: rolesValidos
	},
	estado: {
		type: Boolean,
		default: true
	},
	google: {
		type: Boolean,
		default: false
	}, 
	img: {
		type: String,
		required: false
	}
});

// Modifico el metodo toJSON del usuarioSchema para que no me imprima nunca el campo password
usuarioSchema.methods.toJSON = function() {

	let user = this;
	let userObject = user.toObject();
	delete userObject.password;

	return userObject;

}

usuarioSchema.plugin(uniqueValidator, { message: 'El campo {PATH} debe ser único en la base de datos' });

module.exports = mongoose.model('Usuario', usuarioSchema);

