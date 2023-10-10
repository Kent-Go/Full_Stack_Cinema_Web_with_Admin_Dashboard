import React, { useContext, useState, useEffect } from 'react';
import { MovieContext } from './MovieContext';
import { gqlGetMovies, gqlGetSessionTime, gqlAllReservations } from '../data/repository';
import './componentCSS/Movies.css'
import MovieModal from './miniComponents/MovieModal';  // Import the MovieModal component
import AddMovieModal from './miniComponents/AddMovieModal';  // Import the AddMovieModal component
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

function Movies() {
  const [movies, setMovies] = useState([]);
  const [reservationDate, setReservationDate] = useState({});  // Create reservationDate object to store the number of reservation made on each reservation date
  const { state, setSelectedMovie, clearSelectedMovie } = useContext(MovieContext);
  const [addModalOpen, setAddModalOpen] = useState(false);

  useEffect(() => {
    const fetchMovieData = async () => {
      try {
        const moviesData = await gqlGetMovies();

        // Fetch session times for each movie
        const movieSessionTimesPromises = moviesData.map(async (movie) => {
          try {
            const sessionTimes = await gqlGetSessionTime(movie.movie_id);
            return { ...movie, sessionTimes }; // Combine movie data with session times
          } catch (error) {
            console.error(`Error fetching session times for movie ${movie.movie_id}:`, error);
            return { ...movie, sessionTimes: [] }; // Return empty array for session times on error
          }
        });

        // Wait for all session times requests to complete
        const moviesWithSessionTimes = await Promise.all(movieSessionTimesPromises);
        setMovies(moviesWithSessionTimes);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    /**
     * Load all reservations from database and store the number of reservation made on each reservation date
     */
    const loadReservations = async () => {
      // Fetch all reservations
      const reservationsData =  await gqlAllReservations();
      // Create new object to store number of reservation per day
      const reservationDateObject = {};
  
      // Iterate the reservationsData to get each reservation date occurence
      reservationsData.forEach(reservation => {
  
        // Get reservation date
        const reservation_date = reservation['reservation_date'];
        // Check if reservation date already exist in reservationDateObject
        if (reservationDateObject[reservation_date] == null) {
          // Intialise new attribute for the reservation date
          reservationDateObject[reservation_date] = 1;
        }
        else {
          // Increment reservation date count
          reservationDateObject[reservation_date] += 1;
        }
      });
  
      setReservationDate(reservationDateObject);
    };

    fetchMovieData();
    loadReservations();
  }, []);

  const handleRowClick = (movie) => {
    setSelectedMovie(movie);  // Set the selected movie when a row is clicked
  };

  const closeModal = () => {
    clearSelectedMovie();
  };

  const handleAddMovie = () => {
    setAddModalOpen(true);
  }

  const closeAddModal = () => {
    setAddModalOpen(false);
  }

  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );
      
  const movieViewOptions = {
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
          max: 120,
        },
      xAxes: [{ barPercentage: 0.5 }]
    }
  };

  const reservationDataOptions = {
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
          step: 2
        },
      xAxes: [{ barPercentage: 0.5 }]
    }
  };

  /**
   * Create movieViewData object to store the number of views for each movie
   */
  const movieViewData = {
    labels: movies.map(movie => movie.title),
    datasets: [
      {
        label: "Number Of Views",
        data: movies.map(movie => movie.viewCount),
        fill: true,
        backgroundColor: "rgba(75,192,192,0.2)",
        borderColor: "rgba(75,192,192,1)"
      }
    ]
  };

  /**
   * Create reservationData object to store the number of reservation made on each reservation date
   */
  const reservationData = {
    labels: Object.keys(reservationDate).map(date => date),
    datasets: [
      {
        label: "Number Of Reservation",
        data: Object.values(reservationDate).map(dateCount => dateCount),
        fill: true,
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      }
    ]
  };

  return (
    <div>
      <div className="chart-title">
        <h1>Number Of View Per Movie</h1>
      </div>
      <div className='barchart'>
        {/* Display the bar chart */}
        <Bar data={movieViewData} options={movieViewOptions} />
      </div>

      <div className="chart-title">
        <h1>Number Of Ticket Reservation Per Day</h1>
      </div>
      <div className='barchart'>
        {/* Display the line chart */}
        <Line data={reservationData} options={reservationDataOptions} />
      </div>

      <div className="header">
        <h1>Now Showing Movies</h1>
        <button className="add-movie-button" onClick={handleAddMovie} title='Click to add new movies'>
          <FontAwesomeIcon icon={faCirclePlus} />
        </button>
        {addModalOpen && <AddMovieModal closeModal={closeAddModal} />}
      </div>
      <table>
        <thead>
          <tr>
            <th>Movie ID</th>
            <th>Movie Title</th>
            <th>Session Times</th>
            <th>Average Rating</th>
            <th>View Count</th>
          </tr>
        </thead>
        <tbody>
          {/* Display all movies in table */}
          {movies.map((movie) => (
            <tr key={movie.movie_id} onClick={() => handleRowClick(movie)} title='Click to edit or delete'>
              <td>{movie.movie_id}</td>
              <td>{movie.title}</td>
              <td>
                <ul>
                  {movie.sessionTimes.map((sessionTime) => (
                    <li key={sessionTime.sessionTimeId}>{sessionTime.sessionTime}</li>
                  ))}
                </ul>
              </td>
              <td>{movie.averageRating}</td>
              <td>{movie.viewCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {state.selectedMovie && (
        <MovieModal isOpen={!!state.selectedMovie} closeModal={closeModal} movie={state.selectedMovie} />
      )}
    </div>
  );
}

export default Movies;