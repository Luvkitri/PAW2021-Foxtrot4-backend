const express = require('express');
const router = express.Router();
const cards = require('./cards');
const models = require('../models');

// @desc Get all the lists for current board 
// @route GET /boards/:boardId/lists
router.get('/', async (req, res) => {
    try {
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
        console.error(error.message);
        res.status(500).send(error.message);
    }
});

// @desc Get list by id 
// @route GET /boards/:boardId/lists/:listId
router.get('/:listId', async (req, res) => {
    try {
        const results = await models.List.findByPk(req.params.listId);

        let list = {
            id: results.id,
            list_name: results.list_name,
            position: results.position,
            archived: results.archived,
            board_id: results.board_id
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
        await models.List.destroy({
            where: {
                id: req.params.listId
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
        const listData = req.body;
        // if board_id not specified in request body, but given in url
        if (!listData.board_id && req.boardId) {
            listData.board_id = req.boardId;
        }

        /**  TODO: automatic listData.position if not specified, 
        //              equal to number of lists in given board + 1
        //              or some arbitrary number, like 99999 so initialy it will always be last
        */
        const newList = models.List.build(listData);
        await newList.save();

        res.status(201).json(newList);
    } catch (error) {
        console.error(error.message);
        res.status(500).send(error.message);
    }
});

// @desc Archive list by Id
// @route POST /boards/:boardId/lists/archive
router.post('/archive', async (req, res) => {
    try {
        let listId = req.body.id;

        await models.List.update({
            archived: true
        }, {
            where: {
                id: listId
            }
        });

        //(maybe) TODO: check number of affected rows, in case of invalid id

        //(maybe) TODO: return changed list object
        res.status(200).send({
            result: true
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send(error.message);
    }
});

// @desc Restore archived list
// @route POST /boards/:boardId/lists/restore
router.post('/restore', async (req, res) => {
    try {
        let listId = req.body.id;

        await models.List.update({
            archived: false
        }, {
            where: {
                id: listId
            }
        });

        //(maybe) TODO: check number of affected rows, in case of invalid id

        //(maybe) TODO: return changed list object

        res.status(200).send({
            result: true
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send(error.message);
    }
});

router.use('/:listId/cards', (req, res, next) => {
    req.listId = req.params.listId;
    next();
}, cards);


module.exports = router;