const express = require('express');
const router = express.Router();
const models = require('../models');

router.get('/', async (req, res) => {
    try {
        const results = await models.Activity.findAll();

        res.status(200).json(results);
    } catch (error) {
        console.error(error.message);
        res.status(500).send({
            error: error.message
        })
    }
});

router.get('/board/:boardId', async (req, res) => {
    try {
        const boardId = req.params.boardId;
        const results = await models.Activity.findAll({
            where: {
                board_id: boardId
            },
            raw: true,
        });
        const users = await models.User.findAll();
        let x = []
        results.forEach((a) => {
            let user = users.find(u => u.id === a.user_id);
            
            let temp = a;
            temp.username = user.first_name + ' ' + user.last_name;
            x.push(temp)
        });
        res.status(200).json(x);
    } catch (error) {
        console.error(error.message);
        res.status(500).send({
            error: error.message
        })
    }
});

router.post('/add', async (req, res) => {
    try {
        activityData = req.body;

        // Add userId to object
        activityData.user_id = req.user.id;

        const newActivity = await models.Activity.build(activityData);
        await newActivity.save();

        res.status(201).json(newActivity);
    } catch (error) {
        console.error(error.message);
        res.status(500).send({
            error: error.message
        })
    }
})

module.exports = router;