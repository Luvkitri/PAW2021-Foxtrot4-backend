const dotenv = require('dotenv');
const express = require('express');
const port = 5000;

var app = express();

app.use(express.json());


app.all('/*', function(req, res, next){

    console.log(`REQUEST, from ${req.ip}; path ${req.path} `);
    next();

})

app.use('/skeleton', require('./routes/skeleton'));


var server = app.listen(port, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('backend listening at http://%s:%s', host, port);
    //console.log('possible paths : ');
    //console.log(app._router.stack.map(l => (l && l.route && l.route.path) ? l.route.path : null).filter(p => p !== null));
});


