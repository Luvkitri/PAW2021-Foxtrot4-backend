const express = require('express');
const router = express.Router();
const lists = require('./lists');
const models = require('../models');
const { result } = require('lodash');
const _ = require('lodash');

// @desc Get all the boards
// @route GET /boards/
router.get('/', async (req, res) => {
    try {
        const results = await models.Board.findAll({
            raw: true,
            include: [{
                model: models.User,
                as: 'UsersInBoard',
                where: {
                    id: req.user.id
                }
            }]
        });

        let boards = [];

        results.forEach(result => {
            let board = {
                id: result.id,
                board_name: result.board_name,
                last_open: result.last_open,
                visibility: result.visibility,
                archived: result.archived,
                read: result['UsersInBoard.UserBoardRelation.read'],
                write: result['UsersInBoard.UserBoardRelation.write'],
                execute: result['UsersInBoard.UserBoardRelation.execute']
            }

            boards.push(board);
        });

        res.status(200).json(boards);
    } catch (error) {
        console.error(error.message);
        res.status(500).send(error.message);
    }
});

// @desc Opening a board based on ID
// @route GET /boards/:boardId
router.get('/:boardId', async (req, res) => {
    try {
        const results = await models.Board.findByPk(req.params.boardId);
        res.status(200).json(results.dataValues);
    } catch (error) {
        console.error(error.message);
        res.status(500).send(error.message);
    }
});

// @desc Delete board by id
// @route DELETE /boards/:boardId
router.delete('/:boardId', async (req, res) => {
    try {
        await models.Board.destroy({
            where: {
                id: req.params.boardId
            }
        });

        res.status(200).send({ result: true });
    } catch (error) {
        console.error(error.message);
        res.status(500).send(error.message);
    }
});

// @desc Update board by id
// @route PUT /boards/:boardId
router.put('/:boardId', async (req, res) => {
    try {
        let userId = req.user.id;
        let boardId = req.params.boardId;

        console.log(userId);
        console.log(boardId);

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

        // Check if user has this board
        if (!results) {
            res.status(403).send({ error: "User doesn't have rights for that board" });
        }

        // Check if user has rights to update this board
        if (!results['UsersInBoard.UserBoardRelation.execute']) {
            res.status(403).send({ error: "User doesn't have rights to update this board" });
        }

        let updateObject = _.omitBy(req.body, _.isNil);

        await models.Board.update(
            updateObject, {
            where: {
                id: boardId
            }
        });

        let updatedBoard = await models.Board.findByPk(boardId, { raw: true });
        res.status(200).send(updatedBoard);
    } catch (error) {
        res.status(500).send({
            error: error.message
        });
    }
});

// @desc Add new board
// @route POST /boards/add
router.post('/add', async (req, res) => {
    try {
        let boardData = req.body;

        const newBoard = models.Board.build(boardData);
        await newBoard.save();

        let relationData = {
            user_id: req.user.id,
            board_id: newBoard.id,
            read: true,
            write: true,
            execute: true
        }

        const newRelation = models.UserBoardRelation.build(relationData);
        await newRelation.save();

        res.status(201).json(newBoard);
    } catch (error) {
        console.error(error.message);
        res.status(500).send(error.message);
    }
});

// @desc Archive board
// @route POST /boards/archive
router.post('/archive', async (req, res) => {
    //TODO: check if user has acces to perform operation
    try {
        let boardId = req.body.id;

        await models.Board.update({
            archived: true
        }, {
            where: {
                id: boardId
            }
        });

        res.status(200).send({ result: true });
    } catch (error) {
        console.error(error.message);
        res.status(500).send(error.message);
    }
});

// @desc Restore a board from archived state
// @route POST /boards/restore
router.post('/restore', async (req, res) => {
    //TODO: check if user has acces to perform operation
    try {
        let boardId = req.body.id;

        await models.Board.update({
            archived: false
        }, {
            where: {
                id: boardId
            }
        });

        res.status(200).send({ result: true });
    } catch (error) {
        console.error(error.message);
        res.status(500).send(error.message);
    }
})




router.use('/:boardId/lists', (req, res, next) => {
    req.boardId = req.params.boardId;
    next();
}, lists);

module.exports = router;