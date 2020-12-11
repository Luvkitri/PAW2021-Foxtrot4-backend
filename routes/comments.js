const express = require('express');
const router = express.Router();
const models = require('../models');
const _ = require('lodash');

// @desc Add comment to card
// @route POST /cards/:cardId/comments/add
router.post('/add', async (req, res) => {
    
    const card = await models.Card.findByPk(req.cardId)
    // Chcek if card exists
    if (!card) {
        res.status(404).send({
            error: "Card does not exist"
        });
        return;
    }
    let commentData = req.body
    commentData.card_id=Number(req.cardId)
    commentData.CardId=Number(req.cardId)
    commentData.posted_at=new Date()
    console.log(commentData)
    try{
     
        const newEntry = models.Comment.build(commentData);
        await newEntry.save();
        res.status(200).json(newEntry)
    }catch (error) {
        console.error(error.message);
        res.status(500).json(error.message);
    }
   
  
})

// @desc Get card comments 
// @route GET /cards/:cardId/comments/get
router.get('/get', async (req, res) => {
    const card = await models.Card.findByPk(req.cardId)
    // Chcek if card exists
    if (!card) {
        res.status(404).send({
            error: "Card does not exist"
        });
        return;
    }
    let commentData = req.body
    commentData.card_id=req.cardId
    commentData.posted_at=new Date()
    try{
        const comments = await models.Comment.findAll({
            raw: true,
            include: [{
                model: models.Card,
                where: {
                    id: req.cardId
                }
            }]
        });
        let cleanedComments = comments.map(c => {
            return {
                id: c.id,
                content: c.content,
                posted_at: c.posted_at,
            };
        });

        res.status(200).json(cleanedComments)
    }catch (error) {
        console.error(error.message);
        res.status(500).json(error.message);
    }
   
  
})

module.exports = router;