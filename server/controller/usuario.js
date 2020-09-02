const express = require('express');
const bodyParser = require('body-parser');
const Usuario = require('../models/usuario');
const bcrypt = require('bcrypt');
const _ = require('underscore');

// Express 
const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
 
// parse application/json
app.use(bodyParser.json());

// Escucho peticiones del tipo GET (recuperar datos)
app.get('/usuario', function (req, res) {
  	
  	// Agrego parámetros de paginación
  	let desde = req.query.desde || 0;
  	desde = Number(desde);
  	if (desde > 0) desde--;

  	// Seteo el parámetro de límite
  	let limite = req.query.limite || 5;
  	limite = Number(limite);

	Usuario.find({ estado: true }, 'nombre apellido email role estado google img')
			.skip(desde)
			.limit(limite)
			.exec((error, usuarios) => {

				if (error) {
					return res.status(400).json( {
						ok: false,
						error
					});
				}

				Usuario.countDocuments({ estado: true }, (error, cantidadTotalUsuariosActivos) => {

					res.json({
						ok: true,
						usuarios,
						cantidadTotalUsuariosActivos
					});

				});
				

			});

})

// Escucho peticiones del tipo POST (insertar datos)
app.post('/usuario', function (req, res) {
	
	// Parseo el body
	let body = req.body;

	// Creo la instancia de Usuario
	let usuario = new Usuario({
		nombre: body.nombre,
		apellido: body.apellido,
		email: body.email,
		password: bcrypt.hashSync(body.password, 10),
		role: body.role
	});

	// Grabo en la base de datos
	usuario.save((error, usuarioDB) => {

		if (error) {
			return res.status(400).json( {
				ok: false,
				error
			});
		}

		res.json({
			ok: true,
			usuario: usuarioDB
		});

	});

})

// Escucho peticiones del tipo PUT (actualizar datos)
app.put('/usuario/:id', function (req, res) {
	
	// Me quedo con el ID que me envían en la petición
	let id = req.params.id;
	let body = _.pick(req.body, ['nombre', 'apellido', 'email', 'img', 'role', 'estado']);
  	
  	Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (error, usuarioDB) => {

  		if (error) {
  			return res.status(400).json( {
				ok: false,
				error
			});
  		}

  		res.json({
  			ok: true,
  			usuario: usuarioDB
  		});
  	});

})

// Escucho peticiones del tipo DELETE (baja lógica)
app.delete('/usuario/:id', function (req, res) {
  	
  	let id = req.params.id;

  	// Elimina el usuario físicamente de la base de datos
  	//Usuario.findByIdAndRemove(id, (error, usuarioBorrado)
  	// Marcarlo como eliminado (baja lógica)
  	Usuario.findByIdAndUpdate(id, { estado: false }, { new: true }, (error, usuarioBorrado) => {
  		
  		if (error) {
  			return res.status(400).json( {
				ok: false,
				error
			});
  		};

  		// El usuario no existe
  		if (!usuarioBorrado) {
    		return res.status(400).json( {
				ok: false,
				error: {
					message: 'Usuario no encontrado'
				}
			});
  		}

  		res.json({
  			ok:true,
  			usuario: usuarioBorrado
  		});

  	})

})

module.exports = app;