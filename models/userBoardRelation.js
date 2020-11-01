'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class UserBoardRelation extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            UserBoardRelation.belongsTo(models.User);
            UserBoardRelation.belongsTo(models.Board);
        }
    };

    UserBoardRelation.init({
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'User',
                key: 'id'
            }
        },
        board_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Board',
                key: 'id'
            }
        },
        permissions: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    }, {
        sequelize,
        modelName: 'UserBoardRelation',
        tableName: 'user_board_relation',
        timestamps: false,
        underscored: true
    });

    return UserBoardRelation;
};