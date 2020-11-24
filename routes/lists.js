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
            res.status(404).send({
                error: "Board id was not provided"
            });
        }

        const userId = req.user.id;
        const boardId = req.boardId;

        const board = await models.Board.findByPk(boardId, {
            raw: true,
            include: [{
                model: models.User,
                as: 'UsersInBoard',
                where: {
                    id: userId
                }
            }]
        });

        // Chcek if board exists
        if (!board) {
            res.status(404).send({
                error: "Board does not exist"
            });
        }

        // Check if user has permission to access this board
        if (!board['Board.UsersInBoard.UserBoardRelation.read']) {
            res.status(403).send({
                error: "No access to this board"
            });
        }

        const results = await models.List.findAll({
            raw: true,
            include: [{
                model: models.Board,
                where: {
                    id: boardId
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
        const listId = req.params.listId;

        const results = await models.List.findByPk(listId, {
            raw: true,
            include: [{
                model: models.Board,
                as: 'Board',
                include: [{
                    model: models.User,
                    as: 'UsersInBoard',
                    where: {
                        id: userId
                    }
                }]
            }]
        });

        // Check if list exists
        if (!results) {
            res.status(404).send({
                error: "List does not exist"
            });
        }

        // Check if user has permission to access this board
        if (!results['Board.UsersInBoard.UserBoardRelation.read']) {
            res.status(403).send({
                error: "No access to this board"
            });
        }

        const list = {
            id: results.id,
            list_name: results.list_name,
            position: results.position,
            archived: results.archived,
            board_id: results.board_id,
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

        const results = await models.List.findByPk(listId, {
            raw: true,
            include: [{
                model: models.Board,
                as: 'Board',
                include: [{
                    model: models.User,
                    as: 'UsersInBoard',
                    where: {
                        id: userId
                    }
                }]
            }]
        });

        // Check if list exists
        if (!results) {
            res.status(404).send({
                error: "List does not exist"
            });
        }

        // Check if user has permission to access this board
        if (!results['Board.UsersInBoard.UserBoardRelation.read']) {
            res.status(403).send({
                error: "No access to this board"
            });
        }

        // Check if user has rights to edit this board
        if (!results['UsersInBoard.UserBoardRelation.write']) {
            res.status(403).send({
                error: "User doesn't have rights to edit this board"
            });
        }

        // Check if list has been archived befor deleting
        if (!results.archived) {
            res.status(405).send({
                error: "This list cannot be deleted, it hasn't been archived"
            });
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
        } else if (!listData.board_id && !req.boardId) {
            res.status(404).send({
                error: "Board id was not provided"
            });
        }

        const results = await models.Board.findByPk(listData.board_id, {
            raw: true,
            include: [{
                model: models.User,
                as: 'UsersInBoard',
                where: {
                    id: userId
                }
            }]
        });

        // Chcek if board exists
        if (!results) {
            res.status(404).send({
                error: "Board does not exist"
            });
            return;
        }

        // Check if user has permission to access this board
        if (!results['Board.UsersInBoard.UserBoardRelation.read']) {
            res.status(403).send({
                error: "No access to this board"
            });
            return;
        }

        // Check if user has rights to edit this board
        if (!results['UsersInBoard.UserBoardRelation.write']) {
            res.status(403).send({
                error: "User doesn't have rights to edit this board"
            });
            return;
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

        const results = await models.List.findByPk(listId, {
            raw: true,
            include: [{
                model: models.Board,
                as: 'Board',
                include: [{
                    model: models.User,
                    as: 'UsersInBoard',
                    where: {
                        id: userId
                    }
                }]
            }]
        });

        // Check if list exists
        if (!results) {
            res.status(404).send({
                error: "List does not exist"
            });
        }

        // Check if user has permission to access this board
        if (!results['Board.UsersInBoard.UserBoardRelation.read']) {
            res.status(403).send({
                error: "No access to this board"
            });
        }

        // Check if user has rights to edit this board
        if (!results['UsersInBoard.UserBoardRelation.write']) {
            res.status(403).send({
                error: "User doesn't have rights to edit this board"
            });
        }

        const updateObject = _.omitBy(req.body, _.isNil);

        await models.List.update(
            updateObject, {
                where: {
                    id: listId
                }
            });

        const updatedList = await models.List.findByPk(listId, {
            raw: true
        });
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