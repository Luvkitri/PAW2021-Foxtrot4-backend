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
        await queryInterface.bulkInsert('activity', [
            {
                user_id: 1,
                board_id: 1,
                list_id: 2,
                created_at: new Date(),
                description: JSON.stringify({
                    action: 1
                })
            },
            {
                user_id: 1,
                board_id: 1,
                comment_id: 1,
                created_at: new Date(),
                description: JSON.stringify({
                    action: 1
                })
            },
            {
                user_id: 1,
                board_id: 1,
                card_id: 1,
                created_at: new Date(),
                description: JSON.stringify({
                    action: 1
                })
            },
        ])
    },

    down: async (queryInterface, Sequelize) => {
        /**
         * Add commands to revert seed here.
         *
         * Example:
         * await queryInterface.bulkDelete('People', null, {});
         */
        await queryInterface.bulkDelete('activity', null, {
            truncate: true,
            cascade: true,
            restartIdentity: true
        });
    }
};
