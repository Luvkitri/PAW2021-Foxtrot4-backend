'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Comment extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Comment.belongsTo(models.Card);
        }
    };

    Comment.init({
        content: {
            type: DataTypes.STRING,
            allowNull: false
        },
        card_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Card',
                key: 'id'
            }
        }
    }, {
        sequelize,
        modelName: 'Comment',
        tableName: 'comment',
        updatedAt: false,
        createdAt: 'posted_at',
        underscored: true
    });

    return Comment;
};