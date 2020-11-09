'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        /**
         * Add altering commands here.
         *
         * Example:
         * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
         */
        await queryInterface.createTable('user_board_relation', {
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
                references: {
                    model: 'user',
                    key: 'id',
                    as: 'user_id'
                }
            },
            board_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                primaryKey: true,
                references: {
                    model: 'board',
                    key: 'id',
                    as: 'board_id'
                }
            },
            read: {
                type: Sequelize.BOOLEAN,
                allowNull: false
            },
            write: {
                type: Sequelize.BOOLEAN,
                allowNull: false
            },
            execute: {
                type: Sequelize.BOOLEAN,
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
        await queryInterface.dropTable('user_board_relation');
    }
};
