'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Board extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Board.belongsToMany(models.User, { 
                as: 'UsersInBoard',
                through: models.UserBoardRelation,
                foreignKey: 'board_id',
                otherKey: 'user_id'
            });

            Board.hasMany(models.List, {
                foreignKey: 'board_id',
                onDelete: 'CASCADE'
            });
        }
    };

    Board.init({
        board_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        last_open: {
            type: DataTypes.DATE
        },
        visibility: {
            type: DataTypes.STRING,
            allowNull: false
        },
        color: {
            type: DataTypes.INTEGER
        },
        archived: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }
    }, {
        sequelize,
        modelName: 'Board',
        tableName: 'board',
        timestamps: false,
        underscored: true
    });

    return Board;
};