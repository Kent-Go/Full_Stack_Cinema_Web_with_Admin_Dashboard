import React, { useContext, useEffect, useState } from 'react';
import '../componentCSS/MovieModal.css';
import { MovieContext } from '../MovieContext';
import { deleteMovie, gqlGetSessionID, updateMovie, updateSessionTime } from '../../data/repository';

const MovieModal = ({isOpen, closeModal, movie }) => {
    const { state, dispatch } = useContext(MovieContext);
    const [title, setTitle] = useState(movie.title);
    const [errorMessage, setErrorMessage] = useState(null);
    const sessionTimes = movie.sessionTimes;

    useEffect(() => {
        if (!isOpen) {
            dispatch({ type: 'RESET_VIEW' }); // Reset the view when the modal is closed
        }
    }, [isOpen, dispatch]);

    const handleTitleChange = (e) => {
        setTitle(e.target.value);
    };

    const handleEditButtonClick = () => {
        dispatch({ type: 'EDIT' });
    };

    const handleBackButtonClick = async () => {
        await dispatch({ type: 'BACK' });
        setErrorMessage(null) // Reset error message
    };

    const handleDeleteButtonClick = () => {
        dispatch({ type: 'DELETE' });
    };

    const handleCancelDelete = () => {
        dispatch({ type: 'CANCEL_DELETE' });
    };

    const resetModal = async() => {
        await dispatch({ type: 'RESET_VIEW' }); // Reset the modal view
        closeModal(); // Call the existing closeModal function to close the modal
    };

    const handleConfirmDelete = async() => {
        console.log('Delete confirmed for movie:', movie.title);
        await deleteMovie(movie.movie_id);
        alert("The movie is has been deleted!");
        closeModal(); // Close the modal

        // Refresh the movies list by reloading the page
        window.location.reload();
    };

    const handleFormSubmit = async(e) => {
        e.preventDefault();

        // If new session time is not given
        if (e.target.newSessionTime.value === "") {
            setErrorMessage("Please enter a new session time.");
            return;
        }

        // If session time does not change
        if ((e.target.newSessionTime.value === e.target.oldSessionTime.value)) {
            setErrorMessage("Session time invalid. Please enter a new session time.");
            return;
        }

        // If new session time does not have ":"
        if (!/:/.test(e.target.newSessionTime.value)) {
            setErrorMessage("Please enter a new session time with ':'");
            return;
        }

        // If new session time does not have " am" or " pm"
        if (!/(\bam\b|\bpm)/i.test(e.target.newSessionTime.value)) {
            setErrorMessage("Please enter a new session time with ' am' or ' pm'");
            return;
        }

        // If new session time does not have leading zero in hour
        if (/^\d:[0-5][0-9] \b[ap]m$/i.test(e.target.newSessionTime.value)) {
            setErrorMessage("Please add a leading zero to the hour (e.g., 01:30 am)");
            return;
        }

        // If new session time does not have leading zero in minute
        if (e.target.newSessionTime.value.split(":")[1].substring(0, 2).includes(" ")) {
            setErrorMessage("Please add a leading zero to the minute (e.g., 01:00 am)");
            return;
        }            

        // If new session hour time is invalid time
        if (e.target.newSessionTime.value.split(":")[0] > 12) {
            setErrorMessage("Please enter a valid time in a 12-hour clock format (e.g., 01:30 am).");
            return;
        }      
        
        // If new session minute time is invalid
        if (e.target.newSessionTime.value.split(":")[1].substring(0, 2) >= 60 || e.target.newSessionTime.value.split(":")[1].substring(0, 2) < 0) {
            setErrorMessage("Please enter a valid minute.");
            return;
        }  
        
        setErrorMessage(null); // Reset error message since all constraints are met

        // Access the new sessionTime
        const newSessionTime = e.target.newSessionTime.value;

        // Access the selected sessionTime
        const selectedSessionTime = e.target.oldSessionTime.value;

        // Get sessionTimeID based on movie.title and selectedSessionTime
        const sessionTimeID = await gqlGetSessionID(movie.movie_id, selectedSessionTime );

        // If movie title is not changed
        if (movie.title === e.target.title.value) {
            // Change session time only in database
            await updateSessionTime(sessionTimeID.session_id, newSessionTime);
            alert("The session time is has been updated!");
        }
        else{
            // Change movie title and session time in database
            await updateMovie(movie.movie_id, e.target.title.value);
            await updateSessionTime(sessionTimeID.session_id, newSessionTime);
            alert("The movie title and session time has been updated!");
        }

        closeModal(); // Close the modal
        window.location.reload(); // Refresh the page
    };

    return (
        <div className="modal-overlay" onClick={resetModal}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {state.buttonsVisible && (
            <>
                <h2>Selected Movie: {movie.title}</h2>
                <input type="button" value="Back" onClick={closeModal}/>
                <input type="button" value="Edit" onClick={handleEditButtonClick}/>
                <input type="button" value="Delete" onClick={handleDeleteButtonClick}/>
            </>
            )}
            {state.isEditing && (
                <form onSubmit={handleFormSubmit}>
                    <label htmlFor="title">Movie Title:</label>
                    <input type="text" id="title" name="title" value={title} onChange={handleTitleChange}/><br/>
                    <label htmlFor="sessionTime">Change Session Time from:</label>
                    <select id="oldSessionTime" name="oldSessionTime">
                    {sessionTimes.map((session, index) => (
                        <option key={index} value={`${session.sessionTime}`}>
                            {session.sessionTime}
                        </option>
                    ))}
                    </select>
                    to: <input type="text" id="newSessionTime" name="newSessionTime"/><br/>
                    <br/>
                    {errorMessage && <div style={{ color: 'red', marginBottom: '10px' }}>{errorMessage}</div>}
                    <input type="button" value="Back" onClick={handleBackButtonClick}/>
                    <input type="submit" value="Submit"/>
                </form>
            )}
            {state.showConfirmation && (
                <>
                    <h3>Are you sure you want to delete <strong>{movie.title}</strong>?</h3>
                    <button onClick={handleCancelDelete}>Cancel</button>
                    <button onClick={handleConfirmDelete}>Confirm</button>
                </>
            )}
        </div>
    </div>
    );
};

export default MovieModal;