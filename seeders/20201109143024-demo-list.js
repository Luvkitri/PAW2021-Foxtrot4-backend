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

        await queryInterface.bulkInsert('list', [
            {
                list_name: 'list1',
                position: 1,
                board_id: 1
            },
            {
                list_name: 'list2',
                position: 2,
                board_id: 1
            },
            {
                list_name: 'list3',
                position: 3,
                board_id: 1
            },
            {
                list_name: 'list4',
                position: 4,
                board_id: 1
            },
            {
                list_name: 'list5',
                position: 5,
                board_id: 1
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
        await queryInterface.bulkDelete('list', null, {
            truncate: true,
            cascade: true,
            restartIdentity: true
        });
    }
};
