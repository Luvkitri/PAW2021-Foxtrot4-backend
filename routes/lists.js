const express = require('express');
const router = express.Router();
const cards = require('./cards');
const models = require('../models');

// @desc Get all the lists for current board 
// @route GET /boards/:boardId/lists
router.get('/', async (req, res) => {
    try {
        // Check if parm boardId exists
        if (!req.boardId) {
            res.status(404).send({ error: "Board id was not provided" });
        }

        const results = await models.List.findAll({
            raw: true,
            include: [{
                model: models.Board,
                where: {
                    id: req.boardId
                }
            }]
        });

        let lists = []

        results.forEach(result => {
            let list = {
                id: result.id,
                list_name: result.list_name,
                position: result.position,
                archived: result.archived,
            }

            lists.push(list);
        });

        res.status(200).json(lists);
    } catch (error) {
        res.status(500).send({
            error: error.message
        });
    }
});

// @desc Get list by id 
// @route GET /boards/:boardId/lists/:listId
router.get('/:listId', async (req, res) => {
    try {
        const userId = req.user.id;
        const list = await models.List.findByPk(req.params.listId, { raw: true });

        // Check if list exists
        if (!list) {
            res.status(404).send({ error: "List does not exist" });
        }

        const results = await models.Board.findOne({
            raw: true,
            where: {
                id: list.board_id
            },
            include: [{
                model: models.User,
                as: 'UsersInBoard',
                where: {
                    id: userId
                }
            }]
        });

        // Check if user has the board, to access the list
        if (!results) {
            res.status(403).send({ error: "No access to this list" });
        }

        res.status(200).json(list);
    } catch (error) {
        console.error(error.message);
        res.status(500).send(error.message);
    }
});

// @desc Delete list by id
// @route DELETE /boards/:boardId/lists/:listId
router.delete('/:listId', async (req, res) => {
    try {
        const userId = req.user.id;
        const listId = req.params.listId;
        let boardId;

        if (!req.boardId) {
            const list = await models.List.findByPk(listId, { raw: true });
            
            // Check if list exists
            if (!list) {
                res.status(404).send({ error: "List does not exist" });
            }

            boardId = list.board_id;
        } else {
            boardId = req.boardId
        }

        const results = await models.Board.findOne({
            raw: true,
            where: {
                id: boardId
            },
            include: [{
                model: models.User,
                as: 'UsersInBoard',
                where: {
                    id: userId
                }
            }]
        });

        // Check if user has the board, to access the list
        if (!results) {
            res.status(403).send({ error: "No access to this list" });
        }

        // Check if user has rights to edit this board
        if (!results['UsersInBoard.UserBoardRelation.write']) {
            res.status(403).send({ error: "User doesn't have rights to edit this board" });
        }

        await models.List.destroy({
            where: {
                id: listId
            }
        });

        res.status(200).send({
            result: true
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send(error.message);
    }
})


// @desc Add list to board
// @route POST /boards/:boardId/lists/add
router.post('/add', async (req, res) => {
    try {
        const userId = req.user.id;
        const listData = req.body;

        // if board_id not specified in request body, but given in url
        if (!listData.board_id && req.boardId) {
            listData.board_id = req.boardId;
        }

        const results = await models.Board.findOne({
            raw: true,
            where: {
                id: listData.board_id
            },
            include: [{
                model: models.User,
                as: 'UsersInBoard',
                where: {
                    id: userId
                }
            }]
        });

        // Check if user has the board, to access the list
        if (!results) {
            res.status(403).send({ error: "No access to this board" });
        }

        // Check if user has rights to post to this board
        if (!results['UsersInBoard.UserBoardRelation.write']) {
            res.status(403).send({ error: "User doesn't have rights to edit this board" });
        }

        const lists = await models.List.findAll({
            raw: true,
            include: [{
                model: models.Board,
                where: {
                    id: listData.board_id
                }
            }]
        });

        if (!listData.position) {
            listData.position = lists.length + 1;
        }

        const newList = models.List.build(listData);
        await newList.save();

        res.status(201).json(newList);
    } catch (error) {
        console.error(error.message);
        res.status(500).send(error.message);
    }
});

// @desc Update list by id
// @route PUT /lists/:listId
router.put('/:listId', async (req, res) => {
    try {
        const userId = req.user.id;
        const listId = req.params.listId;
        let boardId;

        if (!req.boardId) {
            const list = await models.List.findByPk(listId, { raw: true });
            
            // Check if list exists
            if (!list) {
                res.status(404).send({ error: "List does not exist" });
            }

            boardId = list.board_id;
        } else {
            boardId = req.boardId
        }

        const results = await models.Board.findOne({
            raw: true,
            where: {
                id: boardId
            },
            include: [{
                model: models.User,
                as: 'UsersInBoard',
                where: {
                    id: userId
                }
            }]
        });

        // Check if user has the board, to access the list
        if (!results) {
            res.status(403).send({ error: "No access to this board" });
        }

        // Check if user has rights to post to this board
        if (!results['UsersInBoard.UserBoardRelation.write']) {
            res.status(403).send({ error: "User doesn't have rights to edit this board" });
        }

        const updateObject = _.omitBy(req.body, _.isNil);

        await models.List.update(
            updateObject, {
            where: {
                id: listId
            }
        });

        const updatedList = await models.newList.findByPk(listId, { raw: true });
        res.status(200).json(updatedList);
    } catch (error) {
        res.status(500).send({
            error: error.message
        });
    }
});

router.use('/:listId/cards', (req, res, next) => {
    req.listId = req.params.listId;
    next();
}, cards);


module.exports = router;