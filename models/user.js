'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class User extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            User.belongsToMany(models.Board, {
                as: 'BoardsInUser',
                through: models.UserBoardRelation,
                foreignKey: 'user_id',
                otherKey: 'board_id'
            });
        }
    };

    User.init({
        first_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        last_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false
        },
        login: {
            type: DataTypes.STRING,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'User',
        tableName: 'user',
        updatedAt: 'updated_at',
        createdAt: 'created_at',
        underscored: true
    });

    return User;
};