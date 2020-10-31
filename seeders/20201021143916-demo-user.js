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

        await queryInterface.bulkInsert('users', [
            {
                firstName: 'John',
                lastName: 'Smith',
                email: 'example1@gmail.com',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                firstName: 'Martin',
                lastName: 'Diego',
                email: 'example2@gmail.com',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                firstName: 'Pedro',
                lastName: 'Rodrigez',
                email: 'example3@gmail.com',
                createdAt: new Date(),
                updatedAt: new Date()
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

        await queryInterface.bulkDelete('users', null, {});
    }
};
