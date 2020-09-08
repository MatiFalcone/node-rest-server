// ==================================
// Puerto
// ==================================
process.env.PORT = process.env.PORT || 3000;

// ==================================
// Entorno
// ==================================
process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

// ==================================
// Vencimiento del token
// ==================================
process.env.CADUCIDAD_TOKEN = '48h';

// ==================================
// Seed de autenticación
// ==================================
process.env.SEED = process.env.SEED || 'seed-desarrollo';

// ==================================
// Base de Datos
// ==================================
let urlDB;

if (process.env.NODE_ENV === 'dev') {
	urlDB = 'mongodb://localhost:27017/cafe';
} else {
	urlDB = process.env.MONGO_URI;
}

process.env.URLDB = urlDB;

//===================================
// Google Client ID
//===================================
process.env.CLIENT_ID = process.env.CLIENT_ID || '596004900020-2n4oototavem1e7uc9udehoj0sqqi9u3.apps.googleusercontent.com';