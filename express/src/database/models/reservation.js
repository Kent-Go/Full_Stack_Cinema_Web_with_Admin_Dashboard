module.exports = (sequelize, DataTypes) =>
  sequelize.define("reservation", {
    reservation_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    session_time:{
        type: DataTypes.STRING,
        allowNull: false
    },
    number_tickets: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    }, reservation_date : {
      type: DataTypes.STRING(50),
      allowNull: false
    }
  }, {
    // Don't add the timestamp attributes (updatedAt, createdAt).
    timestamps: false, 
  });