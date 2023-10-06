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
    all_posts: [Post],
    post(post_id: Int): Post,
    post_exists(post_id: Int): Boolean,
    all_movies: [Movie],
    get_movies: [Movie]
  }

  # Mutations (modify data in the underlying data-source, i.e., the database).
  type Mutation {
    block_user(input: UserInput): User,
    delete_post(post_id: Int): Boolean
  }
`);

// The root provides a resolver function for each API endpoint.
graphql.root = {
  // Queries.
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

  // Mutations.
  // create_owner: async (args) => {
  //   const owner = await db.owner.create(args.input);

  //   return owner;
  // },
  // update_owner: async (args) => {
  //   const owner = await db.owner.findByPk(args.input.email);
  
  //   // Update owner fields.
  //   owner.first_name = args.input.first_name;
  //   owner.last_name = args.input.last_name;

  //   await owner.save();

  //   return owner;
  // },
  delete_post: async (args) => {
    const post = await db.post.findByPk(args.post_id);
  
    if(post === null)
      return false;

    // First remove all pets owned by the owner.
    await db.post.update({ comment: '[**** This review has been deleted by the admin ***]', rating: 0 }, 
      { where: { post_id: args.post_id }
    })

    return true;
  }
};

module.exports = graphql;

// Below are some sample queries that can be used to test GraphQL in GraphiQL.
// Access the GraphiQL web-interface when the server is running here: http://localhost:4000/graphql
/*

{
  all_posts {
    post_id,
    title,
    rating,
    comment,
    username
  }
}

{
  all_movies {
    movie_id,
    title,
    imageURL,
    averageRating,
    viewCount,
    posts {
      post_id,
      title,
      rating,
      comment
    }
  }
}

{
  post(post_id: 1) {
    post_id,
    title,
    rating,
    comment
  }
}

{
  post_exists(post_id: 1)
}

mutation {
  create_owner(input: {
    email: "newuser@rmit.edu.au",
    first_name: "New",
    last_name: "User"
  }) {
    email,
    first_name,
    last_name
  }
}

mutation {
  update_owner(input: {
    email: "matthew@rmit.edu.au",
    first_name: "Matthew",
    last_name: "Bolger"
  }) {
    email,
    first_name,
    last_name
  }
}

mutation {
  delete_post(post_id: 1)
}

*/
