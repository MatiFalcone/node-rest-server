const jwt = require('jsonwebtoken');

// Verificar Token
let verificaToken = (req, res, next) => {

	let token = req.get('token');

	jwt.verify(token, process.env.SEED, (error, decoded) => {

		if (error) {
			return res.status(401).json( {
				ok: false,
				error: {
					message: 'Token no válido'
				}
			});
		}

		// En el campo decoded me viene la información del token decodificada
		req.usuario = decoded.usuario;
		next();

	})
	
}

// Verificar Token para imágenes
let verificaTokenImg = (req, res, next) => {

	let token = req.query.token;

	jwt.verify(token, process.env.SEED, (error, decoded) => {

		if (error) {
			return res.status(401).json( {
				ok: false,
				error: {
					message: 'Token no válido'
				}
			});
		}

		// En el campo decoded me viene la información del token decodificada
		req.usuario = decoded.usuario;
		next();

	})
	
}

// Verificar Rol de ADMIN
let verificaAdminRole = (req, res, next) => {

	let usuario = req.usuario;

	if (usuario.role === 'ADMIN_ROLE') {
		next();
	} else {
		return res.json({
				ok: false,
				error: {
					message: 'El usuario no es administrador'
				}
		})
	}
	
}

module.exports = {
	verificaToken,
	verificaTokenImg,
	verificaAdminRole
}