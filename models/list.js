'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class List extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            List.belongsTo(models.Board);
            List.hasMany(models.Card, {
                foreignKey: 'list_id'
            });
        }
    };

    List.init({
        list_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        position: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        archived: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        board_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Board',
                key: 'id'
            }
        }
    }, {
        sequelize,
        modelName: 'List',
        tableName: 'list',
        timestamps: false,
        underscored: true
    });

    return List;
};