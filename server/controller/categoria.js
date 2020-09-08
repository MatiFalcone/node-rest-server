const express = require('express');
const _ = require('underscore');
const Categoria = require('../models/categoria');
let { verificaToken, verificaAdminRole } = require('../middlewares/autenticacion');

let app = express();

//==============================
// Mostrar todas las categorias
//==============================
app.get('/categoria', verificaToken, (req, res) => {

	Categoria.find({})
			.populate('usuario', 'nombre email')
			.sort('descripcion')
			.exec((error, categorias) => {

				if (error) {
					return res.status(400).json( {
						ok: false,
						error
					});
				}
				
				res.json({
					ok: true,
					categorias
				});
			});
});

//==============================
// Mostrar una categoria por ID
//==============================
app.get('/categoria/:id', verificaToken, (req, res) => {

	let id = req.params.id;

	Categoria.findById(id, (error, categoriaDB) => {

		if (error) {
			return res.status(400).json( {
				ok: false,
				error
			});
		}

		if (!categoriaDB) {
    		return res.status(400).json( {
				ok: false,
				error: {
					message: 'Categoría no encontrada'
				}
			});
		}

		res.json({
			ok: true,
			categoria: categoriaDB
		})

	});

});

//===========================
// Crear una nueva categoria
//===========================	
app.post('/categoria', verificaToken, (req, res) => {

	// Parseo el body
	let body = req.body;

	// Creo la instancia de Usuario
	let categoria = new Categoria({
		descripcion: body.descripcion,
		usuario: req.usuario._id
	});

	// Grabo en la base de datos
	categoria.save((error, categoriaDB) => {

		if (error) {
			return res.status(500).json( {
				ok: false,
				error
			});
		}

		if (!categoriaDB) {
			return res.status(400).json( {
				ok: false,
				error
			});
		}

		res.json({
			ok: true,
			categoria: categoriaDB
		});

	});
	
});

//======================================
// Actualizar el nombre de la categoria
//======================================
app.put('/categoria/:id', verificaToken, (req, res) => {

	let id = req.params.id;
	console.log(id);

	let descripcionCategoria = {
		descripcion: req.body.descripcion
	}

	// Regresa la nueva categoria
	Categoria.findByIdAndUpdate(id, descripcionCategoria, { new: true, runValidators: true }, (error, categoriaDB) => {
  		
  		if (error) {
  			return res.status(500).json( {
				ok: false,
				error
			});
  		}

		if (!categoriaDB) {
			return res.status(400).json( {
				ok: false,
				error
			});
		}

  		res.json({
  			ok: true,
  			categoria: categoriaDB
  		});
	})
	
});

//==================================
// Elimina la categoria lógicamente
//==================================
app.delete('/categoria/:id', [verificaToken, verificaAdminRole], (req, res) => {

	let id = req.params.id;

	Categoria.findByIdAndRemove(id, (error, categoriaEliminada) => {
  		
  		if (error) {
  			return res.status(500).json( {
				ok: false,
				error
			});
  		}

  		// La categoria no existe
  		if (!categoriaEliminada) {
    		return res.status(400).json( {
				ok: false,
				error: {
					message: 'Categoría no encontrada'
				}
			});
  		}

  		res.json({
  			ok: true,
  			message: 'La categoría ha sido eliminada',
  			categoria: categoriaEliminada
  		})

	});
	
});

module.exports = app;

