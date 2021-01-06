const express = require('express');
const router = express.Router();
const models = require('../models');
const _ = require('lodash');
const comments = require('./comments')
// @desc Get all the cards
// @route GET /boards/:boardId/lists/:listId/cards
router.get('/', async (req, res) => {
    try {
        // check if parms exists
        if (!req.boardId && !req.listId) {
            res.status(404).send({
                error: "Board id was not provided"
            });
        }

        const userId = req.user.id;
        const boardId = Number(req.boardId);
        const listId = Number(req.listId);

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
            return;
        }

        // Check if user has permission to access this board
        if (!board['UsersInBoard.UserBoardRelation.read']) {
            res.status(403).send({
                error: "No access to this board"
            });
            return;
        }

        const cards = await models.Card.findAll({
            raw: true,
            include: [{
                model: models.List,
                where: {
                    id: listId
                }
            }]
        });


        let cleanedCards = cards.map(c => {
            return {
                id: c.id,
                card_name: c.card_name,
                position: c.position,
                content: c.content,
                archived: c.archived,
                list_id: c.list_id,
                labels: c.labels,
                due_date: c.due_date,
                completed: c.completed,
            };
        });



        res.status(200).json(cleanedCards);
    } catch (error) {
        console.error(error.message);
        res.status(500).send(error.message);
    }
});

// @desc Get card by id
// @route GET /boards/:boardId/lists/:listId/cards/:cardId
router.get('/:cardId', async (req, res) => {
    try {
        const userId = req.user.id;
        const cardId = Number(req.params.cardId);

        const cardWithParents = await models.Card.findByPk(cardId, {
            raw: true,
            include: [{
                model: models.List,
                as: 'List',
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
            }]
        });

        // Chcek if card exists
        if (!cardWithParents) {
            res.status(404).send({
                error: "Card does not exist"
            });
            return;
        }



        const card = await models.Card.findByPk(req.params.cardId);

        let cleanedCard = {
            id: card.id,
            card_name: card.card_name,
            position: card.position,
            content: card.content,
            archived: card.archived,
            list_id: card.list_id,
            labels: card.labels,
            due_date: card.due_date,
            completed: card.completed,
        }

        res.status(200).json(cleanedCard);
    } catch (error) {
        console.error(error.message);
        res.status(500).send(error.message);
    }
});

// @desc Get card by id
// @route DELETE /boards/:boardId/lists/:listId/cards/:cardId
router.delete('/:cardId', async (req, res) => {
    try {
        const userId = req.user.id;
        const cardId = req.params.cardId;

        const results = await models.Card.findByPk(cardId, {
            raw: true,
            include: [{
                model: models.List,
                as: 'List',
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
            }]
        });

        // Check if card exists
        if (!results) {
            res.status(404).send({
                error: "Card does not exist"
            });
            return;
        }

        // Check if user has permission to access this board
        if (!results['List.Board.UsersInBoard.UserBoardRelation.read']) {
            res.status(403).send({
                error: "No access to this board"
            });
            return;
        }

        // Check if user has rights to edit this board
        if (!results['List.Board.UsersInBoard.UserBoardRelation.write']) {
            res.status(403).send({
                error: "User doesn't have rights to edit this board"
            });
            return;
        }

        // Check if card has been archived befor deleting
        if (!results.archived) {
            res.status(405).send({
                error: "This card cannot be deleted, it hasn't been archived"
            });
            return;
        }

        await models.Card.destroy({
            where: {
                id: cardId
            },
            truncate: true,
            cascade: true
        });

        res.status(200).send({
            result: true
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send(error.message);
    }
});

// @desc Add card to list
// @route POST /boards/:boardId/lists/:listId/cards/add
router.post('/add', async (req, res) => {
    try {
        const userId = req.user.id;
        const cardData = req.body;


        // if board_id not specified in request body, but given in url
        if (!cardData.list_id && req.listId) {
            cardData.list_id = Number(req.listId);
        } else if (!cardData.list_id && !req.listId) {
            res.status(404).send({
                error: "Board id was not provided"
            });
            return;
        }

        const results = await models.List.findByPk(cardData.list_id, {
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

        // Chcek if card exists
        if (!results) {
            res.status(404).send({
                error: "Card does not exist"
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
        if (!results['Board.UsersInBoard.UserBoardRelation.write']) {
            res.status(403).send({
                error: "User doesn't have rights to edit this board"
            });
            return;
        }

        const cards = await models.Card.findAll({
            raw: true,
            include: [{
                model: models.List,
                where: {
                    id: cardData.list_id
                }
            }]
        });

        if (!cardData.position) {
            cardData.position = cards.length + 1;
        }

        const newCard = models.Card.build(cardData);
        await newCard.save();
        console.log(cardData)
        res.status(201).json(newCard);
    } catch (error) {
        console.error(error.message);
        res.status(500).send(error.message);
    }
});
// @desc Add comment to card
// @route POST /cards/label
router.put('/label', async (req, res, next) => {
    const card = await models.Card.findByPk(req.body.card_id)
    console.log()
    // Chcek if card exists
    if (!card) {
        res.status(404).send({
            error: "Card does not exist"
        });
        return;
    }
    card.update({
            labels: req.body.label
        }, {
            where: req.body.card_id
        }).then(function (rowsUpdated) {
            res.status(200).json(rowsUpdated)
        })
        .catch(err => {
            res.status(500).send(err.message)
        })




})
// @desc Update card by id
// @route PUT /cards/:cardId
router.put('/:cardId', async (req, res) => {
    try {
        const userId = req.user.id;
        const cardId = Number(req.params.cardId);

        const cardWithParents = await models.Card.findByPk(cardId, {
            raw: true,
            include: [{
                model: models.List,
                as: 'List',
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
            }]
        });

        // Check if card exists
        if (!cardWithParents) {
            res.status(404).send({
                error: "Card does not exist"
            });
            return;
        }

        // Check if user has permission to access this board
        if (!cardWithParents['List.Board.UsersInBoard.UserBoardRelation.read']) {
            res.status(403).send({
                error: "No access to this board"
            });
            return;
        }

        // Check if user has rights to edit this board
        if (!cardWithParents['List.Board.UsersInBoard.UserBoardRelation.write']) {
            res.status(403).send({
                error: "User doesn't have rights to edit this board"
            });
            return;
        }

        const updateObject = _.omitBy(req.body, _.isNil);

        await models.Card.update(
            updateObject, {
                where: {
                    id: cardId
                }
            });

        const updatedObject = await models.Card.findByPk(cardId, {
            raw: true
        });
        res.status(200).json(updatedObject);
    } catch (error) {
        res.status(500).send({
            error: error.message
        });
    }
});

router.use('/:cardId/comments', (req, res, next) => {
    req.cardId = req.params.cardId;
    next();
}, comments);

module.exports = router;