module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('destinations', 'image_url', {
      type: Sequelize.STRING(255),
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn('destinations', 'image_url');
  },
};