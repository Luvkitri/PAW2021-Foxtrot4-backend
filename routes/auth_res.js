require("dotenv").config();

const express = require('express');
const router = express.Router();
const models = require('../models');
const User = models.user;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const user = require("../models/user");

let app = express();
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
        data.password= await bcrypt.hash(req.body.password, 10);
        const newEntry = User.build(data);
        await newEntry.save();

        res.status(201).json('OK');
    } catch (error) {
        console.error(error.message);
        res.status(500).json(error.message);
    }
});

// @desc    Add user
// @route   POST /auth/get_user_info
router.get('/get', authenticateToken, async (req, res) => {
    console.log("sssad");
    try {
        const user = await User.findOne({
            where: {
                login: req.user.name
            }
        });
        res.json(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).json(error.message);
    }
});

function authenticateToken(req, res, next){
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if(token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if(err) return res.sendStatus(403)
        req.user = user
        next();
    })
    
}

let refreshTokens = []
router.post('/token', (req, res) =>{
    const refreshToken = req.body.token;
    if(refreshToken == null) return res.sendStatus(401);
    if(!refreshTokens.includes(refreshToken)) {
        console.log("there is no specified refresh token stored")
        return res.sendStatus(403);
    }
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user)=>{
        if(err) return res.sendStatus(403)
        const accessToken = generateAccessToken({name: user.name})
        res.json({accessToken: accessToken});
    })
})
// @desc    Autheticate user
// @route   POST /auth/login
router.post('/login', async (req, res) => {
    try {
        
        const user = await User.findOne({
            where: {
                login: req.body.login
            }
        });
        const username= { name:user.login};
        if(await bcrypt.compare(req.body.password, user.password)){
            const accessToken = generateAccessToken(username);
            const refreshToken = jwt.sign(username, process.env.REFRESH_TOKEN_SECRET)
            refreshTokens.push(refreshToken);
            res.json({accessToken: accessToken, refreshToken: refreshToken});
        }else{
            res.send("Failed");
        }

    } catch (error) {
        console.error(error.message);
        res.status(500).json(error.message);
    }
});

function generateAccessToken(username){
    return accessToken = jwt.sign(username, process.env.ACCESS_TOKEN_SECRET, {expiresIn:'15s'});
}

module.exports = router;