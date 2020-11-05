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

