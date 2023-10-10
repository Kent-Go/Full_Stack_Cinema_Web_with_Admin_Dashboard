const { buildSchema } = require("graphql");
const db = require("../database");
const graphql = { };

// GraphQL.
// Construct a schema, using GraphQL schema language
graphql.schema = buildSchema(`
  # The GraphQL types are declared first.

  # NOTE: The owner and pet are pseudo-joined; whilst they are related, how they are related is an implementation detail
  # that is NOT exposed in the GraphQL schema. This can be seen with the Pet type which has no field linking it to
  # an owner. That said an owner has many pets and this is exposed within the GraphQL schema by association.
  # Behind the scenes the database pet table has an additional field called email which is a FK to owner.

  type User {
    username: String,
    email: String,
    password_hash: String,
    signUpDate: String,
    blocked: Int,
    posts: [Post]
  }

  type Movie {
    movie_id: Int,
    title: String,
    imageURL: String,
    averageRating: Float,
    viewCount: Int,
    posts: [Post]
  }

  type Post {
    post_id: Int,
    title: String,
    rating: Int,
    comment: String,
    username: String
  }

  type Session {
    session_id: Int,
    sessionTime: String,
    ticketAvailable: Int,
  }

  type Reservation {
    reservation_id: Int,
    session_time: String,
    number_tickets: Int,
    title: String,
    reservation_date: String
  }

  # The input type can be used for incoming data.
  input PostInput {
    post_id: Int,
    title: String,
    rating: Int,
    comment: String,
  }

  input UserInput {
    username: String,
    email: String,
    password_hash: String,
    signUpDate: String
  }

  # Queries (read-only operations).
  type Query {
    all_users: [User],
    all_posts: [Post],
    post(post_id: Int): Post,
    post_exists(post_id: Int): Boolean,
    all_movies: [Movie],
    get_movies: [Movie],
    get_sessionTime(movie_id: Int): [Session],
    get_sessionID(movie_id: Int, sessionTime: String): Session,
    all_reservations: [Reservation]
  }

  # Mutations (modify data in the underlying data-source, i.e., the database).
  type Mutation {
    block_user(username: String): Boolean,
    unblock_user(username: String): Boolean,
    delete_post(post_id: Int): Boolean
  }
`);

// The root provides a resolver function for each API endpoint.
graphql.root = {
  // Queries.
  all_users: async () => {
    return await db.user.findAll();
  },
  all_posts: async () => {
    return await db.post.findAll();
  },
  post: async (args) => {
    return await db.post.findByPk(args.post_id);
  },
  post_exists: async (args) => {
    const count = await db.post.count({ where: { post_id: args.post_id } });
    return count === 1;
  },
  all_movies: async () => {
    return await db.movie.findAll({ include: { model: db.post, as: "posts" } });
  },
  get_movies: async() =>{
    return await db.movie.findAll();
  },
  get_sessionTime: async(args) =>{
    return await db.session.findAll({ where: { movie_id: args.movie_id } });
  },
  get_sessionID: async(args) =>{
    return await db.session.findOne({ where: { movie_id: args.movie_id, sessionTime: args.sessionTime } });
  },
  all_reservations: async () => {
    return await db.reservation.findAll();
  },

  // Mutations.
  block_user: async  (args) => {
    const user = await db.user.findByPk(args.username);
    
    if(user === null)
      return false;

    await db.user.update({ blocked: 1 }, 
      { where: { username: args.username }
    })

    return true;
  },
  unblock_user: async  (args) => {
    const user = await db.user.findByPk(args.username);
    
    if(user === null)
      return false;

    await db.user.update({ blocked: 0 }, 
      { where: { username: args.username }
    })

    return true;
  },
  delete_post: async (args) => {
    const post = await db.post.findByPk(args.post_id);
  
    if(post === null)
      return false;

    // Delete the post
    await db.post.update({ comment: '[**** This review has been deleted by the admin ***]', rating: 0 }, 
      { where: { post_id: args.post_id }
    })

    return true;
  }
};

module.exports = graphql;