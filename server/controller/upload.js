const express = require('express');
const fileUpload = require('express-fileupload');
const Usuario = require('../models/usuario');
const Producto = require('../models/producto');
const fs = require('fs');
const path = require('path');
const app = express();

app.use( fileUpload({ useTempFiles: true }) );

app.put('/upload/:tipo/:id', function (req, res) {
  	
  	let tipo = req.params.tipo;
  	let id   = req.params.id;

  	// Validar tipos

  	let tiposValidos = ['productos', 'usuarios'];

  	if (tiposValidos.indexOf(tipo) < 0) {
		return res.status(400).json({
			ok: false,
			error: {
				message: 'Los tipos permitidos son ' + tiposValidos.join(', '),
				tipo
			}
		})
	}

	if (!req.files || Object.keys(req.files).length === 0) {
    	return res.status(400).json({
    		ok: false,
    		error: {
    			message: 'No se ha seleccionado ningún archivo.'
    		}
		});
	}

	let archivo = req.files.archivo;
	let nombreParseado = archivo.name.split('.');
	let extension = nombreParseado[nombreParseado.length - 1];
	// Extensiones permitidas
	let extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

	if (extensionesValidas.indexOf(extension) < 0) {
		return res.status(400).json({
			ok: false,
			error: {
				message: 'Las extensiones permitidas son ' + extensionesValidas.join(', '),
				extension
			}
		})
	}

	// Cambiar nombre del archivo
	let nombreArchivo = `${ id }-${ new Date().getMilliseconds() }.${ extension }`;

	// Use the mv() method to place the file somewhere on your server
  	archivo.mv(`uploads/${ tipo }/${ nombreArchivo }`, (error) => {
    
    	if (error) {
      		return res.status(500).json({
      			ok: false,
      			error
      		});
      	}

      	// Aquí la imagen ya está cargada
      	if (tipo === 'usuarios') {
        	imagenUsuario(id, nombreArchivo, res);  		
      	} else {
      		imagenProducto(id, nombreArchivo, res);
      	}

    });

});

function imagenUsuario(id, nombreArchivo, res) {

	Usuario.findById(id, (error, usuarioDB) => {

		if (error) {
			borrarArchivo(nombreArchivo, 'usuarios');
			return res.status(500).json({
				ok: false,
				error
			})
		}

		if (!usuarioDB) {
			borrarArchivo(nombreArchivo, 'usuarios');
			return res.status(400).json({
				ok: false,
				error: {
					message: 'El usuario no existe.'
				}
			})
		}

		borrarArchivo(usuarioDB.img, 'usuarios');

		usuarioDB.img = nombreArchivo;

		usuarioDB.save((error, usuarioGuardado) => {
			
			if (error) {
				return res.status(500).json({
					ok: false,
					error
				})
			}

			res.json({
				ok: true,
				usuario: usuarioGuardado
			})

		})

	})

}

function imagenProducto(id, nombreArchivo, res) {

	Producto.findById(id, (error, productoDB) => {

		if (error) {
			borrarArchivo(nombreArchivo, 'productos');
			return res.status(500).json({
				ok: false,
				error
			})
		}

		if (!productoDB) {
			borrarArchivo(nombreArchivo, 'productos');
			return res.status(400).json({
				ok: false,
				error: {
					message: 'El producto no existe.'
				}
			})
		}

		borrarArchivo(productoDB.img, 'productos');

		productoDB.img = nombreArchivo;

		productoDB.save((error, productoGuardado) => {
			
			if (error) {
				return res.status(500).json({
					ok: false,
					error
				})
			}

			res.json({
				ok: true,
				producto: productoGuardado
			})

		})

	})
	
}

function borrarArchivo(nombreArchivo, tipo) {

	// Me fijo si hay una imagen ya cargada y si hay la borra
	let pathImagen = path.resolve(__dirname, `../../uploads/${ tipo }/${ nombreArchivo }`);

	if (fs.existsSync(pathImagen)) {
		fs.unlinkSync(pathImagen);
	}

}

module.exports = app;