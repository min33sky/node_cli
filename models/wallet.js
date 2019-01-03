module.exports = (sequelize, Sequelize) => {
  return sequelize.define(
    'wallet',
    {
      money: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: '금액',
      },
      desc: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: '설명',
      },
      type: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        comment: '수입이면 True, 지출이면 False',
      },
    },
    {
      timestamps: true,
    },
  );
};
