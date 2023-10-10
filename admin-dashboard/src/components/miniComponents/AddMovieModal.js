import { React, useState, useContext } from 'react';
import { MovieContext } from '../MovieContext';
import { gqlGetMovies, createMovie, createSessionTime } from '../../data/repository';

/**
 * Add Movie Modal Component
 * @param {closeModal} closeModal -- function to close the modal 
 */
const AddMovieModal = ({ closeModal }) => {
    const [errorMessage, setErrorMessage] = useState(null);
    const { state, addNewMovieTitle, addNewMovieSessionTime } = useContext(MovieContext);

    const handleTitleChange = (e) => {
        addNewMovieTitle(e.target.value);
    }
    
    const handleTimeChange = (e) => {
        addNewMovieSessionTime(e.target.value);
    }

    /**
     * Add a new movie and its session time to the database
     * @param {event} e
     * @returns 
     */
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const title = e.target.elements.title.value;
        const sessionTime = e.target.elements.sessionTime.value;

        // Title and sessionTime are not given
        if (!title && !sessionTime) {
            setErrorMessage("Please enter a movie title and session time");
            return;
        }

        // Title is not given
        if (!title) {
            setErrorMessage("Please enter a movie title");
            return;
        }

        // Session time is not given
        if (!sessionTime) {
            setErrorMessage("Please enter a session time");
            return;
        }

        // If given session time does not have ":"
        if (!/:/.test(sessionTime)) {
            setErrorMessage("Please enter a new session time with ':'");
            return;
        }

        // If given session time does not have " am" or " pm"
        if (!/(\bam\b|\bpm)/i.test(sessionTime)) {
            setErrorMessage("Please enter a new session time with ' am' or ' pm'");
            return;
        }

        // If given session time does not have leading zero in hour
        if (/^\d:[0-5][0-9] \b[ap]m$/i.test(sessionTime)) {
            setErrorMessage("Please add a leading zero to the hour (e.g., 01:30 am)");
            return;
        }

        // If given session time does not have leading zero in minute
        if (sessionTime.split(":")[1].substring(0, 2).includes(" ")) {
            setErrorMessage("Please add a leading zero to the minute (e.g., 01:00 am)");
            return;
        }            

        // If new session hour time is invalid time
        if (sessionTime.split(":")[0] > 12) {
            setErrorMessage("Please enter a valid time in a 12-hour clock format (e.g., 01:30 am).");
            return;
        }      
        
        // If new session minute time is invalid
        if (sessionTime.split(":")[1].substring(0, 2) >= 60 || sessionTime.split(":")[1].substring(0, 2) < 0) {
            setErrorMessage("Please enter a valid minute.");
            return;
        }  

        setErrorMessage(null); // Reset error message since all constraints are met

        // Get all movies to get the last movieID
        const movies = await gqlGetMovies();
        const lastMovieID = movies[movies.length - 1].movie_id;

        // Create a new movie object with the last movieID + 1
        await createMovie({ movie_id: lastMovieID + 1, title: title, imageURL: "http://localhost:3005/coming-soon.jpeg", averageRating: 0, viewCount: 0 });

        // Create the session time for the movie
        await createSessionTime({ sessionTime: sessionTime, movie_id: lastMovieID + 1 });

        alert("The movie and its session time has been created!");

        // Reset the form
        addNewMovieTitle('');
        addNewMovieSessionTime('');

        closeModal(); // Close the modal
        window.location.reload(); // Refresh the page
    }

    return (
      <div className="modal-overlay" onClick={closeModal}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add a Movie</h2>
            <form onSubmit={handleFormSubmit}>
                <label htmlFor="title">Movie Title:</label>
                <input type="text" id="title" name="title" value={state.addMovieTitle} onChange={handleTitleChange}/><br/>
                <label htmlFor="sessionTime">Session Time in 12-hour format (am/pm) :</label>
                <input type="text" id="sessionTime" name="sessionTime" value={state.addMovieSessionTime} onChange={handleTimeChange}/><br/>
                {errorMessage && <div style={{ color: 'red', marginTop: '10px' }}>{errorMessage}</div>}
                <br></br>
                <input type="button" value="Back" onClick={closeModal}/>
                <input type="submit" value="Submit"/>
            </form>
        </div>
      </div>
    );
  };

export default AddMovieModal;