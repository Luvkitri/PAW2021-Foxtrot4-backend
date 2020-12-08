'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        /**
         * Add altering commands here.
         *
         * Example:
         * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
         */
        await queryInterface.createTable('comment', {
            id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },
            content: {
                type: Sequelize.STRING,
                allowNull: false
            },
            posted_at: {
                type: Sequelize.DATE,
                allowNull: false
            },
            card_id: {
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
        await queryInterface.dropTable('comment');
    }
};
