'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        /**
         * Add altering commands here.
         *
         * Example:
         * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
         */
        await queryInterface.createTable('list', {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },
            list_name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            position: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            archived: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            board_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'board',
                    key: 'id'
                }
            }
        });
    },

    down: async (queryInterface, Sequelize) => {
        /**
         * Add reverting commands here.
         *
         * Example:
         * await queryInterface.dropTable('users');
         */
        await queryInterface.dropTable('list');
    }
};
