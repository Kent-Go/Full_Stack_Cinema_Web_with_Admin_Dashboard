const db = require("../database");
const Reservation = db.reservation;

// Select all reservation from the database.
exports.all = async (req, res) => {
  const reservations = await db.reservation.findAll();

  res.json(reservations);
};

// Select all reservations from the database based on username.
exports.findByUsername = async (req, res) => {
  const reservations = await db.reservation.findAll({ where: { username: req.query.username } })
  .catch(err => {
    res.status(500).send({
      message: "Error get Reservation"
    });
  });

  res.json(reservations);
};

// Create a new reservation in the database.
exports.create = async (req, res) => {

  const reservation = await Reservation.create({
    username: req.body.username,
    reservation_id: req.body.reservation_id,
    session_time: req.body.session_time,
    number_tickets: req.body.number_tickets,
    title: req.body.title,
    reservation_date: req.body.reservation_date
  });

  res.json(reservation);
};