require("dotenv").config();

const express = require('express');
const router = express.Router();
const models = require('../models');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const user = require("../models/user");

const functions = require('../functions');
const authenticateToken = functions.authenticateToken;

// @desc    Welcome message
// @route   GET /auth/
router.get('/', (req, res) => {
    res.send('Auth route');
});

// @desc    Add user
// @route   POST /auth/register
router.post('/register', async (req, res) => {
    try {
        let data = JSON.parse(JSON.stringify(req.body));
        data.password = await bcrypt.hash(req.body.password, 10);

        const user = await models.User.findOne({
            where: {
                login: req.body.login
            }
        });
        if (user) {
            res.status(403).json('Already exists');
            return;
        }

        const newEntry = models.User.build(data);
        await newEntry.save();

        res.status(201).json(true);
    } catch (error) {
        console.error(error.message);
        res.status(500).json(error.message);
    }
});

// @desc    Add user
// @route   POST /auth/get_user_info
router.get('/get', authenticateToken, async (req, res) => {
    try {
        const user = await models.User.findOne({
            where: {
                login: req.user.login
            }
        });
        res.json(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).json(error.message);
    }
});


let refreshTokens = []
router.post('/token', (req, res) => {
    const refreshToken = req.body.token;
    if (refreshToken == null) return res.sendStatus(401);
    if (!refreshTokens.includes(refreshToken)) {
        console.log("there is no specified refresh token stored")
        return res.sendStatus(403);
    }
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        const accessToken = generateAccessToken(user)
        res.json({
            accessToken: accessToken
        });
    })
})

router.post('/logout', (req, res) => {
    refreshTokens = refreshTokens.filter(token => token !== req.body.token)
    res.sendStatus(204)
})

// @desc    Autheticate user
// @route   POST /auth/login
router.post('/login', async (req, res) => {
    try {

        const user = await models.User.findOne({
            where: {
                login: req.body.login
            }
        });

        if (await bcrypt.compare(req.body.password, user.password)) {
            const accessToken = generateAccessToken(user.dataValues);
            const refreshToken = jwt.sign(user.dataValues, process.env.REFRESH_TOKEN_SECRET)
            refreshTokens.push(refreshToken);
            res.status(200).json({
                accessToken: accessToken,
                refreshToken: refreshToken
            });
        } else {
            res.status(403).send("Failed");
        }

    } catch (error) {
        console.error(error.message);
        res.status(500).json(error.message);
    }
});

function generateAccessToken(user) {
    return accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '9999999s'
    });
}

module.exports = router;