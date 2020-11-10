const express = require('express');
const router = express.Router();
const models = require('../models');

// @desc Get all the cards
// @route GET /boards/:boardId/lists/:listId/cards
router.get('/', async (req, res) => {
    try {
        const results = await models.Card.findAll({
            raw: true,
            include: [{
                model: models.List,
                where: {
                    id: req.listId
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
    //TODO: check if card is archived, if not then refuse action
    try {
        await models.Card.destroy({
            where: {
                id: req.params.cardId
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
        const cardData = req.body;
        // if board_id not specified in request body, but given in url
        if (!cardData.list_id && req.listId) {
            cardData.list_id = req.listId;
        }

        const newCard = models.Card.build(cardData);
        await newCard.save();

        res.status(201).json(newCard);
    } catch (error) {
        console.error(error.message);
        res.status(500).send(error.message);
    }
});

// @desc Archive card by id
// @route POST /boards/:boardId/lists/:listId/cards/archive
router.post('/archive', async (req, res) => {
    try {
        let cardId = req.body.id;

        await models.Card.update({
            archived: true
        }, {
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

// @desc Restore card by id
// @route POST /boards/:boardId/lists/:listId/cards/restore
router.post('/restore', async (req, res) => {
    try {
        let cardId = req.body.id;

        await models.Card.update({
            archived: false
        }, {
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

module.exports = router;