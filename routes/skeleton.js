const express = require('express');
const router = express.Router();

var table = [];


router.get('/', function(req, res){
    res.send('witamy');

    //console.log(req.headers);
    //console.log(res);

});


router.get('/get', function(req, res){
    console.log('getting list');
    res.send(table);
});


router.post('/put', function(req, res){

    console.log(req.body);
    //res.send(req.body);
    let i = 0;
    req.body.forEach(element => {
        table.push(element);
        i += 1;
        console.log('added ', element, 'to list');
    });
    res.send('' + i);
    
});


router.post('/delete', function(req, res){

    console.log(req.body);
    let obj = req.body;


    table = table.filter(v => v.key !== obj.key);

    res.send(table);
    
});


module.exports = router;
