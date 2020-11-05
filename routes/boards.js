const express = require('express');
const router = express.Router();
const models = require('../models');

// @desc Get all the boards
// @router GET /boards/
router.get('/', async (req, res) => {
    try {
        const results = await models.Board.findAll({
            raw: true,
            include: [{
                model: models.User,
                as: 'UsersInBoard',
                where: { id: 1}
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
                execute:result['UsersInBoard.UserBoardRelation.execute']
            }
    
            boards.push(board);
        });
    
        res.status(201).json(boards);
    } catch(error) {
        console.error(error.message);
        res.status(500).json(error.message);
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
            user_id: 1,
            board_id: newBoard.id,
            read: true,
            write: true,
            execute: true
        }

        const newRelation = models.UserBoardRelation.build(relationData);
        await newRelation.save();

        res.status(201).json("Board added");
    } catch (error) {
        console.error(error.message);
        res.status(500).json(error.message);
    }
});

//@desc Archive a board
//@route POST /boards/archive
router.post('/archive', async (req, res) => {
    try {
        let boardId = req.body.id;
        
        await models.Board.update({ archived: true }, {
            where: {
                id: boardId
            }
        });

        res.status(201).json("Board archived");
    } catch(error) {
        console.error(error.message);
        res.status(500).json(error.message);
    }
});

//@desc Restore a board from archived state
//@route POST /boards/restore
router.post('/restore', async (req, res) => {
    try {
        let boardId = req.body.id;

        await models.Board.update({ archived: false }, {
            where: {
                id: boardId
            }
        });

        res.status(201).json("Board restored");
    } catch(error) {
        console.error(error.message);
        res.status(500).json(error.message);
    }
})

module.exports = router;