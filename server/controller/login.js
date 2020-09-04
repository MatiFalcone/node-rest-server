const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');
const app = express();

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

module.exports = app;
