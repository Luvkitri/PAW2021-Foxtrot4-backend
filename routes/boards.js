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
        let userId = req.user.id;
        
        const results = await models.Board.findAll({
            raw: true,
            include: [{
                model: models.User,
                as: 'UsersInBoard',
                where: {
                    id: userId
                }
            }]
        });

        // Check if user has any boards
        if (!results) {
            res.status(404).send({ error: "No boards found" });
        }

        let boards = [];

        results.forEach(result => {
            let board = {
                id: result.id,
                board_name: result.board_name,
                last_open: result.last_open,
                visibility: result.visibility,
                archived: result.archived,
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
        let userId = req.user.id;
        let boardId = req.params.boardId;

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
            res.status(404).send({ error: "Board does not exist" });
        }

        const board = {
            id: results.id,
            board_name: results.board_name,
            last_open: results.last_open,
            visibility: results.visibility,
            archived: results.archived,
            write: results['UsersInBoard.UserBoardRelation.write'],
            execute: results['UsersInBoard.UserBoardRelation.execute']
        }

        res.status(200).json(board);
    } catch (error) {
        console.error(error.message);
        res.status(500).send(error.message);
    }
});

// @desc Delete board by id
// @route DELETE /boards/:boardId
router.delete('/:boardId', async (req, res) => {
    try {
        let userId = req.user.id;
        let boardId = req.params.boardId;

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
            res.status(404).send({ error: "Board does not exist" });
        }

        // Check if user has rights to update this board
        if (!results['UsersInBoard.UserBoardRelation.execute']) {
            res.status(403).send({ error: "User doesn't have rights to delete this board" });
        }

        const result = await models.Board.destroy({
            where: {
                id: boardId
            }
        });

        if (result == 0) {
            res.status(404).send({ error: "There is no board_with that id" });
        }

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
            res.status(404).send({ error: "Board does not exist" });
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
        res.status(200).json(updatedBoard);
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

router.use('/:boardId/lists', (req, res, next) => {
    req.boardId = req.params.boardId;
    next();
}, lists);

module.exports = router;