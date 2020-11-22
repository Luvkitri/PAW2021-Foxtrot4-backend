const express = require('express');
const router = express.Router();
const models = require('../models');
const bcrypt = require('bcrypt');
const _ = require('lodash');

// @desc get user info by id
// @route GET /users/
router.get('/', async (req, res) => {
    try {
        let userId = req.user.id;
        const results = await models.User.findByPk(userId);
        //dont send back hashed password, for security reasons, duh
        delete results.password
        res.status(200).json(results);
    } catch (error) {
        console.error(error.message);
        res.status(500).send(error.message);
    }
});



// @desc update user info 
// @route PUT /users/
router.put('/', async (req, res) => {
    try {
        let userId = req.user.id;
        delete req.body.id;
        //in case rquest want to change user's password, encrypt it
        if (req.body.password) {
            req.body.password = await bcrypt.hash(req.body.password, 10);
        }

        //this will delete null and undefined properties from object
        //let updateObject = _(req.body).omit(_.isUndefined).omit(_.isNull).value();
        let updateObject = _.omitBy(req.body, _.isNil);



        await models.User.update(
            updateObject, {
                where: {
                    id: userId
                }
            }
        );
        let updatedObject = await models.User.findByPk(userId);
        let user = updatedObject.dataValues;
        //dont send back hashed password, for security reasons, duh
        delete user.password;
        res.status(200).send(user);
    } catch (error) {
        res.status(500).send({
            error: error.message
        });
    }

});



// @desc delete user account (not ready)
// @route DELETE /boards/:boardId/lists/:listId/cards/:userId
router.delete('/:userId', async (req, res) => {
    res.status(501).send({
        error: 'Mothod not implemented'
    })
});




module.exports = router;