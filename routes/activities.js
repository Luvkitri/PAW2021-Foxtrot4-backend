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
        //const boards= await models.Board.findAll();
        //const lists= await models.List.findAll();
        let x = [];

        for(let i = 0; i < results.length; i++){

            let a = results[i];
            let user = users.find(u => u.id === a.user_id);
            let temp = a;
            temp.username = user.first_name + ' ' + user.last_name;
            if (a.board_id && !a.list_id && !a.card_id && !a.comment_id) {
                let board = await models.Board.findOne({
                    where: {
                        id: a.board_id
                    }
                })
                temp.name = board.board_name
            } else if (a.card_id) {
                let card = await models.Card.findOne({
                    where: {
                        id: a.card_id
                    }
                })
                temp.name = card.card_name
            } else if (a.list_id) {
                let list = await models.List.findOne({
                    where: {
                        id: a.list_id
                    }
                })
                temp.name = list.list_name
            } else {
                temp.name = ""
            }

            x.push(temp)


        }



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