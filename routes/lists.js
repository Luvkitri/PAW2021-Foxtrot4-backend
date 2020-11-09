const express = require('express');
const router = express.Router();
const models = require('../models');

// @desc get all the lists for current borderRadius: 
// @route /boards/:boardId/lists
router.get('/', async (req, res) => {
    const results = await models.List.findAll({
        raw: true,
        include: [{
            model: models.Board,
            where: {
                id: req.boardId
            }
        }]
    });

    console.log(results);
});


module.exports = router;