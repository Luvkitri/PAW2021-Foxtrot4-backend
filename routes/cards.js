const express = require('express');
const router = express.Router();
const models = require('../models');

// @desc Get all the cards
// @route GET /boards/:boardId/lists/:listId/cards
router.get('/', async (req, res) => {
    try {
        // check if parms exists
        if (!req.boardId && !req.listId) {
            res.status(404).send({ error: "Board id was not provided" });
        }

        const userId = req.user.id;
        const boardId = req.boardId;
        const listId = req.listId;

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
            res.status(404).send({ error: "Board does not exist" });
        }

        // Check if user has permission to access this board
        if (!board['Board.UsersInBoard.UserBoardRelation.read']) {
            res.status(403).send({ error: "No access to this board" });
        }

        const results = await models.Card.findAll({
            raw: true,
            include: [{
                model: models.List,
                where: {
                    id: listId
                }
            }]
        });

        let cards = [];

        results.forEach(result => {
            let card = {
                id: result.id,
                card_name: result.card_name,
                position: result.position,
                content: result.content,
                archived: result.archived
            }

            cards.push(card);
        });

        res.status(200).json(cards);
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
        const cardId = req.params.cardId

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

        // Chcek if card exists
        if (!results) {
            res.status(404).send({ error: "Card does not exist" });
        }

        // Check if user has permission to access this board
        if (!results['Board.UsersInBoard.UserBoardRelation.read']) {
            res.status(403).send({ error: "No access to this board" });
        }

        const results = await models.Card.findByPk(req.params.cardId);

        let card = {
            id: results.id,
            card_name: results.card_name,
            position: results.position,
            content: results.content,
            archived: results.archived,
            list_id: results.list_id
        }

        res.status(200).json(card);
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
            res.status(404).send({ error: "Card does not exist" });
        }

        // Check if user has permission to access this board
        if (!results['Board.UsersInBoard.UserBoardRelation.read']) {
            res.status(403).send({ error: "No access to this board" });
        }

        // Check if user has rights to edit this board
        if (!results['UsersInBoard.UserBoardRelation.write']) {
            res.status(403).send({ error: "User doesn't have rights to edit this board" });
        }

        // Check if card has been archived befor deleting
        if (!results.archived) {
            res.status(405).send({ error: "This card cannot be deleted, it hasn't been archived" });
        }
        
        await models.Card.destroy({
            where: {
                id: cardId
            }
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
            cardData.list_id = req.listId;
        } else if (!cardData.list_id && !req.listId) {
            res.status(404).send({ error: "Board id was not provided" });
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
            res.status(404).send({ error: "Card does not exist" });
        }

        // Check if user has permission to access this board
        if (!results['Board.UsersInBoard.UserBoardRelation.read']) {
            res.status(403).send({ error: "No access to this board" });
        }

        // Check if user has rights to edit this board
        if (!results['UsersInBoard.UserBoardRelation.write']) {
            res.status(403).send({ error: "User doesn't have rights to edit this board" });
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

        res.status(201).json(newCard);
    } catch (error) {
        console.error(error.message);
        res.status(500).send(error.message);
    }
});

// @desc Update card by id
// @route PUT /cards/:cardId
router.put('/:cardId', async (req, res) => {
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
            res.status(404).send({ error: "Card does not exist" });
        }

        // Check if user has permission to access this board
        if (!results['Board.UsersInBoard.UserBoardRelation.read']) {
            res.status(403).send({ error: "No access to this board" });
        }

        // Check if user has rights to edit this board
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

module.exports = router;