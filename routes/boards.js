const express = require('express');
const router = express.Router();
const lists = require('./lists');
const models = require('../models');

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
})

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