require('./config/config');
const express = require('express')
const bodyParser = require('body-parser')

// Express 
const app = express()

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
 
// parse application/json
app.use(bodyParser.json())

// Escucho peticiones del tipo GET (recuperar datos)
app.get('/usuario', function (req, res) {
  	res.json('GET usuario')
})

// Escucho peticiones del tipo POST (insertar datos)
app.post('/usuario', function (req, res) {
	let body = req.body;

	if (body.nombre === undefined) {
		res.status(400).json({
			ok: false,
			mensaje: `El campo 'nombre' del usuario no fue informado`
		});
	}

  	res.json({
  		persona: body
  	});
})

// Escucho peticiones del tipo PUT (actualizar datos)
app.put('/usuario/:id', function (req, res) {
	let id = req.params.id;
  	res.json({
  		id,
  	});
})

// Escucho peticiones del tipo DELETE (baja lógica)
app.delete('/usuario', function (req, res) {
  	res.json('DELETE usuario')
})
 
app.listen(process.env.PORT, () => {
	console.log(`Escuchando en el puerto: ${ process.env.PORT }`);
})