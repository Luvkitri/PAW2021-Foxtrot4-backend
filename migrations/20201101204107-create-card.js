'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        /**
         * Add altering commands here.
         *
         * Example:
         * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
         */
        await queryInterface.createTable('card', {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },
            card_name: {
                type: Sequelize.STRING,
                allowNull: false
            },
            position: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            content: {
                type: Sequelize.STRING,
                allowNull: false
            },
            labels: {
                type: Sequelize.STRING,
            },
            due_date: {
                type: Sequelize.DATE
            },
            completed: {
                type: Sequelize.BOOLEAN
            },
            archived: {
                type: Sequelize.BOOLEAN,
                allowNull: false,
                defaultValue: false
            },
            list_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'list',
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
        await queryInterface.dropTable('card');
    }
};
