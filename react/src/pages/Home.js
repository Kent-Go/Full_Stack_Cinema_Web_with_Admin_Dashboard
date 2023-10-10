import React,  { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import './pagesCSS/Home.css';
import MovieCard from './pageResources/MovieCard';
import AboutUs from './pageResources/AboutUs'
import { getMovies, getSessionTime, addReservation, updateSessionTicketAvailable } from '../data/repository';

/**
 * Homepage component.
 * @param {username} props - username of the current user from App.js
 */
function Home(props) {
  const [movies, setMovies] = useState([]);
  const [reservationLimit, setReservationLimit] = useState(null);
  const [reservationErrorMessage, setReservationErrorMessage] = useState(null);
  const navigate = useNavigate();

  // constant variable for reservation date and its format
  const todayDate = new Date();
  const dateFormat = { year: 'numeric', month: 'short', day: 'numeric' };

  const handleSubmit = async (event, time, ticket, title) => {
    event.preventDefault();

    // Set variable for reservation error due to fail validation
    var reservationError = false;

    // Check if ticket is valid
    if (ticket <= 0 || Number.isNaN(ticket)) {
      setReservationErrorMessage("Please reserve at least 1 ticket.");
      reservationError = true;
    }
    else if (ticket > reservationLimit) {
      setReservationErrorMessage(`Please reserve at most ${reservationLimit} ticket(s).`);
      reservationError = true;
    }
    else if (ticket > 0 && ticket <= reservationLimit && reservationErrorMessage !== null) {
      setReservationErrorMessage(null);
    }

    // Terminate handleSubmit if fail validation
    if (reservationError === true) {
      return;
    }

    // Add new reservation to database
    await addReservation({username: props.username, session_time: time, number_tickets: ticket, title: title, reservation_date: todayDate.toLocaleDateString('en-GB', dateFormat)});
    // Update session time ticket availability in database
    await updateSessionTicketAvailable({session_time: time, number_tickets: ticket, title: title});
    // Provide reservation success visual cue
    alert(`Your reservation for ${ticket} ticket(s) for ${title} at ${time} is successful!`);
    // Refresh
    navigate(0);
  }

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        // Fetch movies from database
        const movies = await getMovies();
        // Sort Movies from highest to Lowest Rating
        movies.sort((movie1,movie2) => movie2.averageRating - movie1.averageRating);
        // Fetch session times for each movie
        const movieSessionTimesPromises = movies.map(async (movie) => {
          try {
            const sessionTimes = await getSessionTime(movie.movie_id);
            return { ...movie, sessionTimes };  // Combine movie data with session times
          } catch (error) {
            console.error(`Error fetching session times for movie ${movie.movie_id}:`, error);
            return { ...movie, sessionTimes: [] };  // Return empty array for session times on error
          }
        });

        // Wait for all session times requests to complete
        const moviesWithSessionTimes = await Promise.all(movieSessionTimesPromises);

        setMovies(moviesWithSessionTimes);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchMovieData();
  }, []);

  return (
    <>
    <h1 className='section-title'>Ticket Reservation</h1>
    <section className="movie-section">
      <div className='movie-row'>
        {/* When user HAS NOT logged in*/}
        {props.username == null &&
          <>
            {/*Display all movies*/}
            {
              movies.map((movie) =>
                <div className='movie-column'>
                  <MovieCard
                  imageUrl={movie.imageURL}
                  title={movie.title}
                  text="Click to view session time"
                  averageRating = {movie.averageRating}
                  type="movie"
                  sessionTimeArray={movie.sessionTimes}
                  />
                </div>
              )
            }
          </>
        }
        {/* When user HAS logged in*/}
        {props.username !== null &&
          <>
            {
              movies.map((movie) =>
                <div className='movie-column'>
                  <MovieCard
                  imageUrl={movie.imageURL}
                  title={movie.title}
                  text="Click to view session time"
                  averageRating = {movie.averageRating}
                  type="movieReservation"
                  sessionTimeArray={movie.sessionTimes}
                  handleSubmit={(event, time, ticket) => handleSubmit(event, time, ticket, movie.title)}
                  setReservationLimit = {setReservationLimit}
                  setReservationErrorMessage = {setReservationErrorMessage}
                  reservationErrorMessage = {reservationErrorMessage}
                  />
                </div>
              )
            }
          </>
        }
      </div>
    </section>
    {/* Display About Us component */}
    <AboutUs/>
    </>
  );
}

export default Home;