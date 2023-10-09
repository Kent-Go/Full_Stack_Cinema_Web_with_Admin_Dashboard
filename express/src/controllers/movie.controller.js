const db = require("../database");
const Movie = db.movie;
const Session = db.session;
const Post = db.post;

// Select all users from the database.
exports.all = async (req, res) => {
  const movies = await db.movie.findAll();

  res.json(movies);
};

// Select one movie from the database based on id.
exports.findByMovieId = async (req, res) => {
  const movies = await db.movie.findByPk(req.params.id);

  res.json(movies);
};

// Select one user from the database based on title.
exports.findByMovieTitle = async (req, res) => {
  const movies = await db.movie.findOne({ where: { title: req.query.title } });

  res.json(movies);
};

// Create a movie in the database.
exports.create = async (req, res) => {
  const movie = await Movie.create({
    movie_id: req.body.movie_id,
    title: req.body.title,
    imageURL: req.body.imageURL,
    averageRating: req.body.averageRating,
    viewCount: req.body.viewCount
  });

  res.json(movie);
};

// Update movie detail in the database.
exports.update = async (req, res) => {
  const id = req.params.id;
  
  Movie.update({ title: req.body.title }, 
    { where: { movie_id: id }
  })
  .then(num => {
    if (num == 1) {
      res.send({
        message: "Movie was updated successfully."
      });
    } else {
      res.send({
        message: `Cannot update Movie with movie_id=${id}. Maybe Movie was not found or req.body is empty!`
      });
    }
  })
  .catch(err => {
    res.status(500).send({
      message: "Error updating Movie with movie_id=" + id
    });
  });
}

// Update movie average rating with the given movie id
exports.updateAverageRating = async (req, res) => {
  const ratingCount = await Post.count({
    where: {
      movie_id: req.params.id,
      rating: { [db.Op.gt]: 0 },

    }
  }); 

  if (ratingCount == 0) {
    Movie.update({averageRating: 0}, {
      where: { movie_id: req.params.id }
    })
    return;
  }

  const totalRating = await Post.sum('rating', { where: { movie_id: req.params.id, rating: { [db.Op.gt]: 0 }} });

  const averageRating = totalRating / ratingCount;

  Movie.update({averageRating: averageRating}, {
    where: { movie_id: req.params.id }
  })

  .then(num => {
    if (num == 1) {
      res.send({
        message: "Movie average rating was updated successfully."
      });
    } else {
      res.send({
        message: `Cannot update Movie average rating with movie_id=${req.params.id}. Maybe Movie was not found or req.body is empty!`
      });
    }
  })
  .catch(err => {
    res.status(500).send({
      message: `Error updating Movie average rating with movie_id=${req.params.id}`
    });
  });
}

// Delete a movie based on id
exports.delete = async (req, res) => {
  const id = req.params.id;
  try {
    // Delete all posts related to the movie
    await Post.destroy({
      where: { movie_id: id }
    })

    // Delete session time related to the movie
    await Session.destroy({
      where: { movie_id: id }
    })

    // Delete movie
    const num = await Movie.destroy({
      where: { movie_id: id }
    })
    if (num == 1) {
      res.send({
        message: "Movie was deleted successfully!"
      });
    } else {
      res.send({
        message: `Cannot delete Movie with movie_id=${id}. Maybe Movie was not found!`
      });
    }
  } catch (e) {
    console.log(err)
    res.status(500).send({
      message: "Could not delete Movie with movie_id=" + id
    });
  }
};

exports.incrementViewCount = async (req, res) => {
  const title = req.params.title;
  try {
    // Delete all posts related to the movie
    await Movie.increment('viewCount', { by: 1, where: { title:title }})
    
    // if (num == 1) {
    //   res.send({
    //     message: "Movie viewCount was increment successfully!"
    //   });
    // } else {
    //   res.send({
    //     message: `Cannot increment Movie viewCount with title=${title}. Maybe Movie was not found!`
    //   });
    // }
  } catch (e) {
    console.log(err)
    res.status(500).send({
      message: "Could not increment Movie viewCount with title" + title
    });
  }
};