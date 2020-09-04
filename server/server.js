// Requires
require('./config/config');
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
 
// parse application/json
app.use(bodyParser.json());

// Configuracion global de rutas
app.use(require('./controller/index'));

// Me conecto a la base de datos de MongoDB
mongoose.connect(process.env.URLDB, {
  	useNewUrlParser: true,
  	useUnifiedTopology: true,
  	useFindAndModify: false,
  	useCreateIndex: true
}, (error, respuesta) => {

	if (error) throw error;

	console.log("Base de datos ONLINE");
});

// Me congo a la escucha en el puerto para recibir peticiones
app.listen(process.env.PORT, () => {
	console.log(`Escuchando en el puerto: ${ process.env.PORT }`);
})