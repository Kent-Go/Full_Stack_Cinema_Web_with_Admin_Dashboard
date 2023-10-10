import React, { useEffect, useState, useContext } from 'react';
import { gqlGetPosts, gqlDeletePost, gqlAllMovies } from "../data/repository";
import './componentCSS/Reviews.css';
import MessageContext from "./MessageContext";
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

function Reviews() {
    const [reviews, setReviews] = useState([]);
    const [movies, setMovies] = useState([]);
    const { setMessage } = useContext(MessageContext);
    const [averageReviewPerMovie, setAverageReviewPerMovie] = useState(0);

    // Load posts and movies.
    useEffect(() => {
        loadPosts();
        loadMovies();
    }, []);

    // Calculate average number of reveiws per movie
    useEffect(() => {
      setAverageReviewPerMovie(reviews.length / movies.length);
    }, [reviews, movies]);

    const loadPosts = async () => {
        const currentReview = await gqlGetPosts();
        setReviews(currentReview);
    };

    const loadMovies = async () => {
      const currentMovie = await gqlAllMovies();
      setMovies(currentMovie);
    };

    ChartJS.register(
      CategoryScale,
      LinearScale,
      BarElement,
      Title,
      Tooltip,
      Legend
    );
        
    const options = {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: "bottom",
          labels: {
            fontColor: "#323130",
            fontSize: 14
          }
        },
      },
      scales: {
        y:
          {
            min: 0,
            max: 30,
            stepSize: 2,
          },
          xAxes: [{ barPercentage: 0.5 }]
        }
    };

    /**
     * Create data object to store the number of reviews for each movie
     */
    const data = {
      labels: movies.map(movie => movie.title),
      datasets: [
        {
          label: "Number Of Reviews",
          data: movies.map(movie => movie.posts.length),
          fill: true,
          backgroundColor: "rgba(75,192,192,0.2)",
          borderColor: "rgba(75,192,192,1)"
        }
      ]
    };

    /**
     * Delete post handle function
     * @param {Number} post_id - post id of the post to be deleted
     */
    const handleDelete = async (post_id) => {
        if(!window.confirm(`Are you sure you want to delete?`))
          return;
        
        const isDeleted = await gqlDeletePost(post_id);

        if(isDeleted) {
          // Could remove the post that was deleted or refresh the posts.
          // Here the posts are refreshed.
          await loadPosts();

          setMessage(<>Post (ID:<strong>{post_id}</strong>) has been deleted successfully.</>);
        }
    };

    if(reviews === null)
        return null;

    return (
      <>
        <div className='dashboard-content'>
          <div className="chart-title">
            <h1>Number Of Review Per Movie</h1>
          </div>

          <div className='barchart'>
            {/* Display the bar chart */}
            <Bar data={data} options={options} />
          </div>

          <div className='averageNumberReview'>
            <h3 style={{marginRight : "5px"}}>Average Number of Review Per Movie:</h3>
            {averageReviewPerMovie > 0 && <h3>{averageReviewPerMovie.toFixed(2)}</h3>}
          </div>
        </div>
        
        <div className='dashboard-content'>
          <div className="header">
            <h1>All Reviews</h1>
          </div>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Title</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
                {/* Display all reviews in table */}
                {reviews.map(review =>
                <tr >
                    <td>{review.post_id}</td>
                    <td>{review.username}</td>
                    <td>{review.title}</td>
                    <td>{review.rating}</td>
                    <td> <div dangerouslySetInnerHTML={{ __html: review.comment }} /></td>
                    <td>
                      {review.rating !== 0  ? (<button className="btn btn-danger" onClick={() => handleDelete(review.post_id)}>Delete</button>) 
                      : (<p>Deleted</p>)}
                    </td>
                </tr>
                )}
            </tbody>
          </table>
        </div>
      </>
    );
}

export default Reviews;