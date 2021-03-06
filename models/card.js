'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Card extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Card.belongsTo(models.List);
            Card.hasMany(models.Comment, {
                foreignKey: 'card_id',
                onDelete: 'CASCADE'
            });
        }
    };

    Card.init({
        card_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        position: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        content: {
            type: DataTypes.STRING,
        },
        labels: {
            type: DataTypes.STRING,
        },
        due_date: {
            type: DataTypes.DATE,
        },
        completed: {
            type: DataTypes.BOOLEAN
        },
        archived: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        list_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'List',
                key: 'id'
            }
        }
    }, {
        sequelize,
        modelName: 'Card',
        tableName: 'card',
        timestamps: false,
        underscored: true
    });

    return Card;
};