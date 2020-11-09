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
        await queryInterface.bulkInsert('board', [
            {
                board_name: 'board1',
                last_open: new Date(),
                visibility: 'Public',
            },
            {
                board_name: 'board2',
                last_open: new Date(),
                visibility: "Public",
            },
            {
                board_name: 'board3',
                last_open: new Date(),
                visibility: "Public",
            },
            {
                board_name: 'board5',
                last_open: new Date(),
                visibility: "Public",
            },
            {
                board_name: 'board6',
                last_open: new Date(),
                visibility: "Public",
            }
        ])
    },

    down: async (queryInterface, Sequelize) => {
        /**
         * Add commands to revert seed here.
         *
         * Example:
         * await queryInterface.bulkDelete('People', null, {});
         */
        await queryInterface.bulkDelete('board', null, {
            truncate: true,
            cascade: true,
            restartIdentity: true
        });
    }
};
