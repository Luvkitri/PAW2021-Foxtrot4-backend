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

        await queryInterface.bulkInsert('card', [
            {
                card_name: 'card1',
                content: 'content1',
                position: 1,
                list_id: 1
            },
            {
                card_name: 'card2',
                content: 'content2',
                position: 2,
                list_id: 1
            },
            {
                card_name: 'card3',
                content: 'content3',
                position: 3,
                list_id: 1
            },
            {
                card_name: 'card4',
                content: 'content4',
                position: 4,
                list_id: 2
            },
            {
                card_name: 'card5',
                content: 'content5',
                position: 5,
                list_id: 2
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
        await queryInterface.bulkDelete('card', null, {
            truncate: true,
            cascade: true,
            restartIdentity: true
        });
    }
};
