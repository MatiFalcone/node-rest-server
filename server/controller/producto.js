const express = require('express');
const _ = require('underscore');
const { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion');
let Producto = require('../models/producto');
let app = express();

//=============================
// Obtener todos los productos
//=============================
app.get('/producto', verificaToken, (req, res) => {
  	// Agrego parámetros de paginación
  	let desde = req.query.desde || 0;
  	desde = Number(desde);
  	if (desde > 0) desde--;

  	// Seteo el parámetro de límite
  	let limite = req.query.limite || 5;
  	limite = Number(limite);

	Producto.find({ disponible: true })
			.skip(desde)
			.limit(limite)
			.sort('nombre')
			.populate('usuario', 'nombre email')
			.populate('categoria', 'descripcion')
			.exec((error, productos) => {

				if (error) {
					return res.status(500).json( {
						ok: false,
						error
					});
				}

				res.json({
					ok: true,
					productos
				});
				
			});

})

//============================
// Obtener un producto por ID
//============================
app.get('/producto/:id', verificaToken, (req, res) => {

	let id = req.params.id;

	Producto.findById(id)
		.populate('usuario', 'nombre email')
		.populate('categoria', 'descripcion')
		.exec((error, productoDB) => {

			if (error) {
				return res.status(500).json( {
					ok: false,
					error
				});
			}

			if (!productoDB) {
				return res.status(400).json( {
					ok: false,
					error: {
						message: 'El producto no existe.'
					}
				});		
			}

			res.json({
				ok: true,
				producto: productoDB
			});

		})

})

//=========================
// Crear un nuevo producto 
//=========================
app.post('/producto', verificaToken, (req, res) => {

	let body = req.body;

	let producto = new Producto({
		nombre: body.nombre,
		precioUni: body.precioUni,
		descripcion: body.descripcion,
		disponible: body.disponible,
		categoria: body.categoria,
		usuario: req.usuario._id
	});

	producto.save((error, productoDB) => {

		if (error) {
			return res.status(500).json( {
				ok: false,
				error
			});
		}

		res.status(201).json({
			ok: true,
			producto: productoDB
		});

	})

})

//========================
// Actualizar un producto 
//========================
app.put('/producto/:id', verificaToken, (req, res) => {

	let id = req.params.id;
	let body = _.pick(req.body, ['nombre', 'precioUni', 'descripcion', 'disponible', 'categoria', 'usuario']);

	Producto.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (error, productoDB) => {
  		
  		if (error) {
  			return res.status(500).json( {
				ok: false,
				error
			});
  		}

		if (!productoDB) {
			return res.status(400).json( {
				ok: false,
				error: {
					message: 'El producto no existe.'
				}
			});
		}

  		res.json({
  			ok: true,
  			producto: productoDB
  		});
	})

})

//==================================
// Eliminar un producto lógicamente
//==================================
app.delete('/producto/:id', [verificaToken, verificaAdminRole], (req, res) => {
	// actualizo el estado del producto ("disponible")
	let id = req.params.id;

	Producto.findByIdAndUpdate(id, { disponible: false }, { new: true, runValidators: true }, (error, productoDB) => {
  		
  		if (error) {
  			return res.status(500).json( {
				ok: false,
				error
			});
  		}

		if (!productoDB) {
			return res.status(400).json( {
				ok: false,
				error: {
					message: 'El producto no existe.'
				}
			});
		}

  		res.json({
  			ok: true,
  			producto: productoDB
  		});
	})

})

app.get('/producto/buscar/:termino', verificaToken, (req, res) => {

	let termino = req.params.termino;
	let regex = new RegExp(termino, 'i');

	Producto.find({nombre: regex})
		.populate('categoria', 'nombre')
		.exec((error, productos) => {

			if (error) {
  				return res.status(500).json( {
					ok: false,
					error
				});
  			}

  			res.json({
  				ok:true,
  				productos
  			})

		})

})

module.exports = app;

