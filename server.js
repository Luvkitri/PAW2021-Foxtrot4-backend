const dotenv = require('dotenv');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const functions = require('./functions');
const authenticateToken = functions.authenticateToken;


// Load env variables
dotenv.config({
    path: './config/.env'
});

let app = express();

// * Middleware

app.use(express.json());
app.use(cors());


// Logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Routes
app.all('/*', (req, res, next) => {
    console.log(`REQUEST, from ${req.ip}; path ${req.path} `);
    next();
});

app.use('/auth', require('./routes/auth'));
app.use('/boards', authenticateToken, require('./routes/boards'));

// Server start
//const port = process.env.PORT;

const port = 5000;

let server = app.listen(port, () => {
    let host = server.address().address;
    let port = server.address().port;
    console.log('backend listening at http://%s:%s', host, port);
});