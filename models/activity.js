'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Activity extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            Activity.belongsTo(models.Board);
        }
    };

    Activity.init({
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        board_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        list_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        card_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        comment_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        description: {
            type: DataTypes.JSON,
            allowNull: false
        },
    }, {
        sequelize,
        modelName: 'Activity',
        tableName: 'activity',
        createdAt: 'created_at',
        updatedAt: false,
        underscored: true
    });

    return Activity;
};