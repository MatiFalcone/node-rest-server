const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');
const { OAuth2Client } = require('google-auth-library');
const app = express();

const client = new OAuth2Client(process.env.CLIENT_ID);

app.post('/login', (req, res) => {

	let body = req.body;

	Usuario.findOne({ email: body.email }, (error, usuarioDB) => {

		if (error) {
			return res.status(500).json( {
				ok: false,
				error
			})
		}

		if (!usuarioDB) {
			return res.status(500).json( {
				ok: false,
				error: {
					message: '(Usuario) o contraseña incorrectos'
				}
			})	
		}

		if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
			return res.status(400).json( {
				ok: false,
				error: {
					message: 'Usuario o (contraseña) incorrectos'
				}
			})
		}

		// Envío en el token la información del usuario que se loguea
		let token = jwt.sign({
			usuario: usuarioDB
		}, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN }); // Expira en 30 dias

		res.json({
			ok: true,
			token,
			usuario: usuarioDB
		});

	})

})

// Configuraciones de Google
async function verify(token) {
  const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
  });
  const payload = ticket.getPayload();

  return {
  	nombre: payload.name,
  	email: payload.email,
  	img: payload.picture,
  	google: true
  }

}

app.post('/google', async (req, res) => {

	let token = req.body.idtoken;

	let googleUser = await verify(token)
		.catch(error => {
			return res.status(403).json({
				ok: false,
				error: {
					message: 'Error de Google User'
				}
			})
		})
	
	Usuario.findOne({ email: googleUser.email }, (error, usuarioDB) => {

		if (error) {
			return res.status(500).json({
				ok: false,
				error: {
					message: 'Falló el find del usuario'
				}
			})
		}

		if (usuarioDB) {
			if (usuarioDB.google === 'false') {
				return res.status(400).json({
					ok: false,
					error: {
						message: 'Debe utilizar su autenticacion normal.'
					}
				})
			} else {
				let token = jwt.sign({
					usuario: usuarioDB
				}, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN }); // Expira en 30 dias

				return res.json({
					ok: true,
					token,
					usuario: usuarioDB
				});
			}
		} else {
			// Si el usuario no existe en nuestra base de datos
			let usuario = new Usuario();

			usuario.nombre = googleUser.nombre;
			usuario.apellido = googleUser.nombre;
			usuario.email = googleUser.email;
			usuario.img = googleUser.picture;
			usuario.google = true;
			usuario.password = ':)';

			usuario.save((error, usuarioDB) => {

				if (error) {
					return res.status(500).json({
						ok: false,
					error
					})
				}

				let token = jwt.sign({
					usuario: usuarioDB
				}, process.env.SEED, { expiresIn: process.env.CADUCIDAD_TOKEN }); // Expira en 30 dias

				return res.json({
					ok: true,
					token,
					usuario: usuarioDB
				});
			})
		}
	})
});

module.exports = app;
