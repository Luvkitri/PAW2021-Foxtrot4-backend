const express = require('express');
const router = express.Router();
const lists = require('./lists');
const models = require('../models');
const _ = require('lodash');

// @desc Get all the boards
// @route GET /boards/
router.get('/', async (req, res) => {
    try {
        const userId = req.user.id;

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
            res.status(404).send({
                error: "No boards found"
            });
        }

        let boards = [];

        results.forEach(result => {
            let board = {
                id: result.id,
                board_name: result.board_name,
                last_open: result.last_open,
                visibility: result.visibility,
                color: result.color,
                archived: result.archived,
                read: result['UsersInBoard.UserBoardRelation.read'],
                write: result['UsersInBoard.UserBoardRelation.write'],
                execute: result['UsersInBoard.UserBoardRelation.execute']
            }

            boards.push(board);
        });

        res.status(200).json(boards);
    } catch (error) {
        res.status(500).send({
            error: error.message
        });
    }
});

// @desc Opening a board based on ID
// @route GET /boards/:boardId
router.get('/:boardId', async (req, res) => {
    try {
        const userId = req.user.id;
        const boardId = req.params.boardId;

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
            res.status(404).send({
                error: "Board does not exist"
            });
        }

        const board = {
            id: results.id,
            board_name: results.board_name,
            last_open: results.last_open,
            visibility: results.visibility,
            color: results.color,
            archived: results.archived,
            read: results['UsersInBoard.UserBoardRelation.read'],
            write: results['UsersInBoard.UserBoardRelation.write'],
            execute: results['UsersInBoard.UserBoardRelation.execute']
        }

        res.status(200).json(board);
    } catch (error) {
        res.status(500).send({
            error: error.message
        });
    }
});

// @desc Delete board by id
// @route DELETE /boards/:boardId
router.delete('/:boardId', async (req, res) => {
    try {
        const userId = req.user.id;
        const boardId = Number(req.params.boardId);

        const results = await models.Board.findOne({
            raw: true,
            where: {
                id: boardId
            },
            include: [{
                model: models.User,
                as: 'UsersInBoard',
                where: {
                    id: 1
                }
            }]
        });

        // Check if user has this board
        if (!results) {
            res.status(404).send({
                error: "Board does not exist"
            });
            return;
        }

        // Check if user has rights to update this board
        if (!results['UsersInBoard.UserBoardRelation.execute']) {
            res.status(403).send({
                error: "User doesn't have rights to delete this board"
            });
            return;
        }

        // Check if board has been archived befor deleting
        if (!results.archived) {
            res.status(405).send({
                error: "This board cannot be deleted, it hasn't been archived"
            });
            return;
        }

        const result = await models.Board.destroy({
            where: {
                id: boardId
            },
            truncate: true,
            cascade: true
        });

        res.status(200).send({
            result: true
        });
    } catch (error) {
        res.status(500).send({
            error: error.message
        });
    }
});

// @desc Update board by id
// @route PUT /boards/:boardId
router.put('/:boardId', async (req, res) => {
    try {
        const userId = req.user.id;
        const boardId = req.params.boardId;

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
            res.status(404).send({
                error: "Board does not exist"
            });
        }

        // Check if user has rights to update this board
        if (!results['UsersInBoard.UserBoardRelation.execute']) {
            res.status(403).send({
                error: "User doesn't have rights to update this board"
            });
        }

        const updateObject = _.omitBy(req.body, _.isNil);

        await models.Board.update(
            updateObject, {
                where: {
                    id: boardId
                }
            });

        const updatedBoard = await models.Board.findByPk(boardId, {
            raw: true
        });
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
        const boardData = req.body;

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
        res.status(500).send({
            error: error.message
        });
    }
});

router.use('/:boardId/lists', (req, res, next) => {
    req.boardId = req.params.boardId;
    next();
}, lists);

module.exports = router;