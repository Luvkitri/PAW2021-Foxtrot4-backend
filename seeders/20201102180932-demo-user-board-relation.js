'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        /**
         * Add seed commands here.
         *
         * Example:
         * await queryInterface.bulkInsert('People', [{
         *   name: 'John Doe',
         *   isBetaMember: false
         * }], {});
        */
        await queryInterface.bulkInsert('user_board_relation', [
            {
                user_id: 1,
                board_id: 1,
                read: true,
                write: true,
                execute: true
            },
            {
                user_id: 1,
                board_id: 2,
                read: true,
                write: true,
                execute: true
            },
            {
                user_id: 2,
                board_id: 2,
                read: true,
                write: true,
                execute: false
            },
            {
                user_id: 2,
                board_id: 3,
                read: true,
                write: true,
                execute: true
            },
            {
                user_id: 2,
                board_id: 4,
                read: true,
                write: true,
                execute: true
            },
            {
                user_id: 3,
                board_id: 5,
                read: true,
                write: false,
                execute: false
            },
            {
                user_id: 2,
                board_id: 5,
                read: true,
                write: true,
                execute: false
            }
        ]);
    },

    down: async (queryInterface, Sequelize) => {
        /**
         * Add commands to revert seed here.
         *
         * Example:
         * await queryInterface.bulkDelete('People', null, {});
         */
        await queryInterface.bulkDelete('user_board_relation', null, {});
    }
};
