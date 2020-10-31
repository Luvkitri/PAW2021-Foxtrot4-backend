const express = require('express');
const router = express.Router();
const models = require('../models');
const User = models.user;

let table = [];

// @desc    Welcome message
// @route   GET /skeleton/
router.get('/', (req, res) => {
    res.send('witamy');
});

// @desc    Return table
// @route   GET /skeleton/get
router.get('/get', async (req, res) => {
    try {
        const users = await User.findAll();
        res.send(JSON.stringify(users, null, 2));
    } catch (error) {
        console.error(error.message);
        res.status(500).json(error.message)
    }
});

// @desc    Add table elements
// @route   POST /skeleton/get
router.post('/put', async (req, res) => {
    try {
        let data = JSON.parse(JSON.stringify(req.body));

        const newEntry = User.build(data);
        await newEntry.save();

        res.status(201).json('OK');
    } catch (error) {
        console.error(error.message);
        res.status(500).json(error.message)
    }
});

// @desc    Remove element from table
// @route   POST /skeleton/delete
router.post('/delete', async (req, res) => {
    try {
        await User.destroy({
            where: {
                id: req.body.id
            }
        });
        
        res.status(201).json('OK');
    } catch (error) {
        console.error(error.message);
        res.status(500).json(error.message);
    }
});


module.exports = router;
