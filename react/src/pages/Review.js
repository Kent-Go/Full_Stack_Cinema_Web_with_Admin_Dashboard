import React, { useState, useEffect } from "react";
import "./pagesCSS/Review.css"
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css';
import { useNavigate } from "react-router-dom";
import MovieCard from './pageResources/MovieCard';
import { getMovies, addNewReview, getReviews, deleteReview, updateReview, findByMovieTitle, updateMovieAverageRating } from "../data/repository";
import { MDBIcon, MDBBtn, MDBModal, MDBModalDialog, MDBModalContent, MDBModalBody } from 'mdb-react-ui-kit';
import { FaStar} from 'react-icons/fa'

/**
 * 
 * @param {username} props.username - curent user's username
 * @returns Review page
 */

function Review(props) {
  const navigate = useNavigate();

  const [movies, setMovies] = useState([]);
  const [post, setPost] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const [posts, setPosts] = useState([]); // Store posts in state
  const [selectedPostIndex, setSelectedPostIndex] = useState(null);
  const [EditReviewModal, setEditReviewModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(null);

  const showReview = (index) => {
    setSelectedPostIndex(index);
    setEditReviewModal(true);
  };  

  /**
   * Sets the rating state to the new rating.
   * @param {Number} newRating - new rating for the post
   */
  // Rating change handler
  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  /**
   * Edit post handler.
   * @async
   * @method
   * @param {*} event
   * @param {Number} newRating - new rating for the post
   * @param {String} newComment - new comment for the post
   * @param {Number} postIndex - index of the post to be edited
   * @returns 
   */
  const handleEditPost = async (event, newRating, newComment, postIndex) => {
    event.preventDefault();

    // Check if comment exceed 600 characters
    if(newComment.length > 600) {
      setErrorMessage("The comment has exceeded the maximum length of 600 characters.");
      return;
    }
    // Check if comment is empty
    else if(newComment.trim() === "") {
      setErrorMessage("Your comment cannot be empty.");
      return;
    }
    // Check if rating is valid
    else if(newRating < 1 || newRating > 5){
      setErrorMessage("Please select a rating.");
      return;
    }

    // Provide visual cue to user to confirm review edit
    const confirmEdit = window.confirm("Are you sure you want to edit your review?");

    if (confirmEdit) {
      // Get all posts from database
      const reviews = await getReviews(); 
      // Get post_id of the review to be deleted
      const post_id = reviews[postIndex].post_id;
      // Get movie_id of the review to be deleted
      const movie_id = reviews[postIndex].movie_id;

      // Delete review from localStorage
      await updateReview(post_id, newRating, newComment)
      // Update movie average rating
      await updateMovieAverageRating(movie_id);

      // Visual cue for alerting user review is edited
      alert("Your review is now edited!"); 
      // Navigate to the review page.
      navigate("/review");
      // Refresh page
      navigate(0);
    }
  };

  /**
   * Remove post handler.
   * @async
   * @method
   * @param {*} event 
   * @param {Number} index - index of the post to be deleted
   * @param {String} title - title of the movie to be deleted
   */
  const handleRemovePost = async (event, index, title) => {
    event.preventDefault();
    const confirmDelete = window.confirm("Are you sure you want to delete your review?");
    if (confirmDelete) {
      // Get all posts from database
      const reviews = await getReviews(); 
      // Get post_id of the review to be deleted
      const post_id = reviews[index].post_id;
      // Get movie_id of the review to be deleted
      const movie_id = reviews[index].movie_id;

      // Delete review from localStorage
      await deleteReview(post_id, title)
      // update movie average rating
      updateMovieAverageRating(movie_id);

      // Visual cue for alerting user review is deleted
      alert("Your review is now deleted!");
      // Navigate to the review page.
      navigate("/review");
      // Refresh page
      navigate(0);
    }
  };

  // Fetches the reviews data from the database every time the page rerenders.
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch reviews from database
        const reviews = await getReviews();
        setPosts(reviews);
      } catch (error) {
        // Handle errors if needed
        console.error('Error fetching reviews:', error);
      }
    };
      fetchData();
  }, []);

  // Fetches the movies data from the database and sort it. 
  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        // Fetch movies from database
        const movies = await getMovies();
        // Sort Movies from highest to Lowest Rating
        movies.sort((movie1,movie2) => movie2.averageRating - movie1.averageRating);
        setMovies(movies);
      } catch (error) {
        // Handle errors if needed
        console.error('Error fetching movies:', error);
      }
    };
    fetchMovieData();
  }, []);

  // Scroll to toip when posts array changed (i.e. review edited, review deleted)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [posts]);

  /**
   * Submit Review handler.
   * @async
   * @method
   * @param {*} event 
   * @param {Number} rating - rating for the post
   * @param {String} title - title of the reviewed movie
   * @returns 
   */
  const handleSubmit = async (event, rating, title) => {
    event.preventDefault();

    // Trim the post text.
    // As React Quill uses HTML tags within the text the empty check first removes all HTML elements using a regex.
    const postTrimmed = post.trim();

    // Check if comment is empty
    if (postTrimmed === "") {
      setErrorMessage("Your ratings and/or comment cannot be empty.");
      return;
    }
    // Check if comment exceed 600 characters
    else if(postTrimmed.length > 600) {
      setErrorMessage("The comment has exceeded the maximum length of 600 characters.");
      return;
    }
    // Check if rating is valid
    else if(rating < 1 || rating > 5){
      setErrorMessage("Please select a rating.");
      return;
    }

    const movie = await findByMovieTitle(title);

    // Add new review into database with username, movie title, rating, and comment as body
    await addNewReview({username: props.username, title: title, movie_id: movie.movie_id, rating: rating, comment: postTrimmed})

    // Update movie average rating
    await updateMovieAverageRating(movie.movie_id);

    // Correct values are being added
    const reviews = await getReviews(); // Fetch updated reviews
    setPosts(reviews); // Update state with new reviews

    // Reset post content
    setPost("");
    // Reset error message
    setErrorMessage("");
    // Navigate to review page
    navigate("/review");
    // Refresh page
    navigate(0)
  }

  return (
    <>
    <h1 className="section-title">Select A Movie To Leave A Review</h1>
    <section className="movie-section">
        <div className='movie-row'>
          {/*Display all movies*/}
          {
          movies.map((movie) =>
            <div className='movie-column'>
              <MovieCard
              data-testid="movie-card"
              imageUrl={movie.imageURL}
              title={movie.title}
              text="Click to leave a review"
              averageRating = {movie.averageRating}
              handleSubmit={(event, rating) => handleSubmit(event, rating, movie.title)}
              setPost = {setPost}
              errorMessage={errorMessage}
              post={post}/>
            </div>
          )
          }
        </div>
      </section>
      <div className="content">
        <h1>Review</h1>
        <div>
          {
            posts.length === 0 ?
              <span style={{color: "white"}}>No reviews have been submitted.</span>
              :
              posts.map((x, index) =>
              <div className="post-box">
                <div className="title">                
                  <h3 style={{color: "red"}}>{x.username} ({x.title})</h3>
                  { 
                    x.username === props.username && (
                      <div>
                        <MDBBtn outline color="light" floating href="" role="button" className="forum-delete-icon" id="review-delete-btn" aria-label='edit'  name='edit-button' onClick={() => showReview(index)}>
                          <MDBIcon far icon="edit" style={{fontSize: '1rem'}}/>
                        </MDBBtn>
                        <MDBBtn outline color="light" floating href="" role="button" className="forum-delete-icon" onClick={(event) => handleRemovePost(event, index, x.movieTitle)}>
                          <MDBIcon far icon="trash-alt" style={{fontSize: '1rem'}}/>
                        </MDBBtn>
                      </div>
                    )
                  }
                </div>
                <div className="post-content">
                  <p>Movie Rating: {x.rating} star</p>
                  <div dangerouslySetInnerHTML={{ __html: x.comment }} />
                </div>
              </div>
              )
          }
        </div>
      </div>
      <MDBModal show={EditReviewModal} setShow={setEditReviewModal} tabIndex="-1" centered>
        <MDBModalDialog centered style={{ maxWidth: "35%" }} size="lg">
          <MDBModalContent style={{cbackgroundColor: "black", border: "2px solid #E50815", borderRadius: "0px"}}>
            <MDBModalBody style={{padding: "0"}}>
              <section className="" style={{padding: "0"}}>
                <div className="review-container" style={{margin: "0", width: "auto", border: "none", borderRadius: "0px"}}>
                  <h1 className="reveiw-title">Edit Review</h1>
                  <div className="">
                    <form onSubmit={(event) => handleEditPost(event, rating, post, selectedPostIndex)}>
                      <div className="form-container">
                        <div className="star-rating">
                          {[...Array(5)].map((item, index) => {
                            const currRating = index + 1;
                            return (
                              <label htmlFor="rating" key={index} onMouseEnter={() => setRating(currRating)}>
                                <input type="radio" value={currRating} onClick={() => setRating(currRating)} />
                                <FaStar
                                  className="star"
                                  size={40}
                                  color={currRating <= (hover || rating) ? "red" : "white"}
                                  onMouseEnter={() => setHover(currRating)}
                                  onMouseLeave={() => setHover(null)}
                                  onClick={() => handleRatingChange(currRating)}
                                />
                              </label>
                            );
                          })}
                        </div>
                      </div>
                      <div className="form-container">
                        <p className="rating-label">Your new rating for the movie is {rating} star</p>
                        <label htmlFor="commentLabel" style={{color:"red", fontFamily: "var(--font-montserrat)", fontSize: "28px", fontWeight: "600"}}>Your Comment</label>
                        <div style={{height:'auto'}}> 
                          <ReactQuill theme="snow" name="post" id="post" value={post} onChange={setPost} />
                        </div>
                      </div>
                      {errorMessage !== null && (
                        <div className="form-container">
                          <span className="text-danger">{errorMessage}</span>
                        </div>
                      )}
                      <div className="form-container">
                        <input type="submit" className="btn submit-btn" value="UPDATE" style={{marginRight: "1rem"}} onClick={(event) => handleEditPost(event, rating, post, selectedPostIndex)}/>
                        <input type="button" className="btn submit-btn" onClick={() => setEditReviewModal(false)} value="CANCEL"/>
                      </div>
                    </form>
                  </div>
                </div>
              </section>
            </MDBModalBody>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
    </>
  );
}

export default Review;