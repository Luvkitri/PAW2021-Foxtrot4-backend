'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        /**
         * Add altering commands here.
         *
         * Example:
         * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
         */
        await queryInterface.createTable('activity', {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            board_id: {
                type: Sequelize.INTEGER,
                allowNull: false
            },
            list_id: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            card_id: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            comment_id: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            description: {
                type: Sequelize.JSON,
                allowNull: false
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false
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
        await queryInterface.dropTable('activity');
    }
};
