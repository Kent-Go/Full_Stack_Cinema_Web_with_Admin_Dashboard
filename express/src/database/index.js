const { Sequelize, DataTypes } = require("sequelize");
const config = require("./config.js");

const db = {
  Op: Sequelize.Op
};

// Create Sequelize.
db.sequelize = new Sequelize(config.DB, config.USER, config.PASSWORD, {
  host: config.HOST,
  dialect: config.DIALECT
});

// Include models.
db.user = require("./models/user.js")(db.sequelize, DataTypes);
db.post = require("./models/post.js")(db.sequelize, DataTypes);
db.movie = require("./models/movie.js")(db.sequelize, DataTypes);
db.session = require("./models/session.js")(db.sequelize, DataTypes);
db.reservation = require("./models/reservation.js")(db.sequelize, DataTypes);

db.user.hasMany(db.post, { foreignKey: 'username' }); // Connect the username of the post table to the username of the user table
db.user.hasMany(db.reservation, { foreignKey: 'username' }); // Connect the username of the post table to the username of the user table
db.movie.hasMany(db.session, { foreignKey: 'movie_id' }); // Connect the movie_id of the session table to the movie_id of the movie table
db.movie.hasMany(db.post, { foreignKey: 'movie_id' }); // Connect the movie_id of the session table to the movie_id of the movie table

// Relate post and user.
// post table belong to user, by creating a new column call username in post table to link with user table
db.post.belongsTo(db.user, { foreignKey: { name: "username", allowNull: false } });
db.post.belongsTo(db.movie, { foreignKey: { name: "movie_id", allowNull: false } });

// Relate session and movie.
// session table belong to movie, by creating a new column call movie_id in session table to link with movie table
db.session.belongsTo(db.movie, { foreignKey: { name: "movie_id", allowNull: false } });

// Relate reservation and user.
db.reservation.belongsTo(db.user, { foreignKey: { name: "username", allowNull: false } });

// Learn more about associations here: https://sequelize.org/master/manual/assocs.html

// Include a sync option with seed data logic included.
db.sync = async () => {
  // Sync schema.
  await db.sequelize.sync();

  // Can sync with force if the schema has become out of date - note that syncing with force is a destructive operation.
  // await db.sequelize.sync({ force: true });
  
  await seedData();
};

async function seedData() {
  const user_table_count = await db.user.count();
  const movie_table_count = await db.movie.count();
  const session_table_count = await db.session.count();

  // Only seed user data if necessary.
  if(user_table_count == 0) {
    const argon2 = require("argon2");

    let hash = await argon2.hash("abc123", { type: argon2.argon2id });
    await db.user.create({ username: "mbolger", password_hash: hash, email: "mbolger@test.com", signUpDate: "Mon, 16 September 2023" });

    hash = await argon2.hash("def456", { type: argon2.argon2id });
    await db.user.create({ username: "shekhar", password_hash: hash, email: "shekhar@test.com", signUpDate : "Tue, 17 September 2023" });

    hash = await argon2.hash("abc123", { type: argon2.argon2id });
    await db.user.create({ username: "kent", password_hash: hash, email: "kent@test.com", signUpDate : "Tue, 17 September 2023" });
  }

  // Only seed movie data if necessary.
  if(movie_table_count == 0) {
    await db.movie.create({ title: "Barbie", imageURL: "http://localhost:3000/movie_posters/barbie.jpeg", averageRating: 0, viewCount: 0 });
    await db.movie.create({ title: "Oppenheimer", imageURL: "http://localhost:3000/movie_posters/oppenheimer.jpeg", averageRating: 0, viewCount: 0 });
    await db.movie.create({ title: "Mission: Impossible - Dead Reckoning Part 1", imageURL: "http://localhost:3000/movie_posters/mission_impossible.jpeg", averageRating: 0, viewCount: 0 });
    await db.movie.create({ title: "The Moon", imageURL: "http://localhost:3000/movie_posters/the_moon.jpeg", averageRating: 0, viewCount: 0 });
    await db.movie.create({ title: "The Marvels", imageURL: "http://localhost:3000/movie_posters/the_marvels.jpeg", averageRating: 0, viewCount: 0 });
    await db.movie.create({ title: "Wonka", imageURL: "http://localhost:3000/movie_posters/wonka.jpeg", averageRating: 0, viewCount: 0 });
    await db.movie.create({ title: "Concrete Utopia", imageURL: "http://localhost:3000/movie_posters/concrete_utopia.jpeg", averageRating: 0, viewCount: 0 });
    await db.movie.create({ title: "Dune Part Two", imageURL: "http://localhost:3000/movie_posters/dune_part_two.jpeg", averageRating: 0, viewCount: 0 });
  }
  
  // Only seed session data if necessary.
  if(session_table_count == 0) {
    await db.session.create({ sessionTime: '10:00 am', movie_id: 1 });
    await db.session.create({ sessionTime: '12:30 pm', movie_id: 1 });
    await db.session.create({ sessionTime: '2:00 pm', movie_id: 1 });
    await db.session.create({ sessionTime: '5:30 pm', movie_id: 1 });
    await db.session.create({ sessionTime: '11:00 am', movie_id: 2 });
    await db.session.create({ sessionTime: '12:00 am', movie_id: 3 });
    await db.session.create({ sessionTime: '13:00 am', movie_id: 4 });
    await db.session.create({ sessionTime: '14:00 am', movie_id: 5 });
    await db.session.create({ sessionTime: '15:00 am', movie_id: 6 });
    await db.session.create({ sessionTime: '16:00 am', movie_id: 7 });
    await db.session.create({ sessionTime: '17:00 am', movie_id: 8 });
  }
}

module.exports = db;