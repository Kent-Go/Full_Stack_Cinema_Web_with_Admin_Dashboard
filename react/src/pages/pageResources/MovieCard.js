import React, { useEffect, useState } from "react";
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css';
import { incrementViewCount } from '../../data/repository';

import {
  MDBCard,
  MDBBtn,
  MDBModal,
  MDBModalDialog,
  MDBModalContent,
  MDBModalTitle,
  MDBModalBody,
} from "mdb-react-ui-kit";

import "./StarRating.css"
import { FaStar} from 'react-icons/fa'

function MovieCard({ imageUrl, title, averageRating, text, type, sessionTimeArray, handleSubmit, errorMessage, setPost, post, setReservationLimit, setReservationErrorMessage, reservationErrorMessage}) {
  const [rating, setRating] = useState(0);
  const [ticket, setTicket] = useState(0);
  const [time, setTime] = useState('');
  const [sessionTicketAvailable, setSessionTicketAvailable] = useState(null);
  const [ticketAvailable, setTicketAvailable] = useState(null);
  const blocked = localStorage.getItem("blocked") || null;

  const [hover, setHover] = useState(null);
  const [MovieModal, setMovieModal] = useState(false);
  const [ReviewModal, setReviewModal] = useState(false);
  const toggleShowMovie = () => setMovieModal(!MovieModal);
  const toggleShowReview = () => setReviewModal(!ReviewModal);

  useEffect(() => {
    try {
      if (time == '') {
        setReservationLimit(null)
        setSessionTicketAvailable(null)
        setTicketAvailable(null)
        setTicket(0)
      }
      else {
        var selectedSession = sessionTimeArray.filter(function(session) {
          return session.sessionTime == time;
          }
        )[0];
        setReservationLimit(selectedSession.ticketAvailable)
        setSessionTicketAvailable(selectedSession.ticketAvailable);
        setTicketAvailable(selectedSession.ticketAvailable + " Left")
        setTicket(0)
      }
    } catch (error) {
      console.error('Error fetching data:', error);
  }      
  }, [time]);

  const handleRatingChange = (newRating) => {
    setRating(newRating);
  };

  const handleTimeChange = (newTime) => {
    setTime(newTime);
  };

  const handleTicketChange = (event) => {
    const newTicketValue = parseInt(event.target.value, 10);  // Convert to an integer
    setTicket(newTicketValue);
    if (Number.isNaN(newTicketValue)) {
      setTicketAvailable(sessionTicketAvailable + " Left")
    }
    else if (sessionTicketAvailable - newTicketValue < 0) {
      setTicketAvailable("Invalid")
    }
    else {
      setTicketAvailable(sessionTicketAvailable-newTicketValue + " Left")
    }
  };

  // increment movie view count handle
  const handleViewMovie = async () => {
    await incrementViewCount(title);
  };

  // MovieCard for displaying coming soon movie
  if (type === "movie") {
    return (
      <>
      <MDBCard className="hover-overlay" onClick={function(event){ toggleShowMovie(); handleViewMovie()}} style = {{cursor: "pointer"}}>
        <img
          src={imageUrl}
          position="top"
          style={{aspectRatio:"2/3",width: "250px", objectFit: "cover"}}
        />
        <div className='mask' style={{backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <div>
            <p style={{fontFamily: "var(--font-montserrat)", fontSize: "23px", fontWeight: "600", color: "rgb(255, 255, 255)", textAlign:"center", lineHeight: "33.6px"}}>{title}</p>
            <p style={{fontFamily: "var(--font-montserrat)", fontSize: "15px", fontWeight: "400", color: "rgb(255, 255, 255)", textAlign:"center"}}>Average Rating: {averageRating.toFixed(2)}</p>
            <p style={{fontFamily: "var(--font-montserrat)", fontSize: "15px", fontWeight: "300", color: "rgb(255, 255, 255)", textAlign:"center"}}>{text}</p>
          </div>
        </div>
      </MDBCard>
      <MDBModal show={MovieModal} setShow={setMovieModal} tabIndex="-1" centered>
        <MDBModalDialog centered style={{maxWidth: "35%"}} size="lg">
          <MDBModalContent style={{ backgroundColor: 'black', border: "2px solid #E50815"}}>
            <MDBModalBody>
              <div style={{display:"flex", flexDirection: "row"}}>
                <div className="modal-image" style={{marginRight:"15px"}}>
                <img
                  src={imageUrl}
                  style={{aspectRatio:"2/3",width: "250px", objectFit: "cover"}}
                />
                </div>
                <div style={{marginLeft:"15px", width: "100%"}}>
                  <MDBModalTitle style={{color:"white", fontFamily:"var(--font-montserrat)"}}>{title}</MDBModalTitle>
                  <div className="" style={{marginTop: "10px"}}>
                    <p style={{color:"white", fontFamily:"var(--font-montserrat)", marginBottom:"7px"}}>Session Times:</p>
                    {sessionTimeArray.map((session) => (
                      <input disabled type="button" className="popup-button" value={session.sessionTime} style={{pointerEvents: 'none'}}/>
                    ))}
                  </div>
                </div>
                <div style={{marginLeft:"15px"}}>
                <MDBBtn
                  className="btn-close"
                  color="none"
                  onClick={toggleShowMovie}
                  style={{backgroundColor: "white"}}>
                </MDBBtn>
                </div>
              </div>
            </MDBModalBody>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
      </>
    );
  } 
  else if (type === "movieReservation") {
    return (
      <>
      <MDBCard className="hover-overlay" onClick={function(event){ toggleShowMovie(); handleViewMovie()}} style = {{cursor: "pointer"}}>
        <img
          src={imageUrl}
          position="top"
          style={{aspectRatio:"2/3",width: "250px", objectFit: "cover"}}
        />
        <div className='mask' style={{backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <div>
            <p style={{fontFamily: "var(--font-montserrat)", fontSize: "23px", fontWeight: "600", color: "rgb(255, 255, 255)", textAlign:"center", lineHeight: "33.6px"}}>{title}</p>
            <p style={{fontFamily: "var(--font-montserrat)", fontSize: "15px", fontWeight: "400", color: "rgb(255, 255, 255)", textAlign:"center"}}>Average Rating: {averageRating.toFixed(2)}</p>
            <p style={{fontFamily: "var(--font-montserrat)", fontSize: "15px", fontWeight: "300", color: "rgb(255, 255, 255)", textAlign:"center"}}>{text}</p>
          </div>
        </div>
      </MDBCard>
      <MDBModal show={MovieModal} setShow={setMovieModal} tabIndex="-1" centered>
        <MDBModalDialog centered style={{maxWidth: "45%"}} size="lg">
          <MDBModalContent style={{ backgroundColor: 'black', border: "2px solid #E50815"}}>
            <MDBModalBody>
              <div style={{display:"flex", flexDirection: "row"}}>
                <div className="modal-image" style={{marginRight:"15px"}}>
                <img
                  src={imageUrl}
                  style={{aspectRatio:"2/3",width: "250px", objectFit: "cover"}}
                />
                </div>
                <div style={{marginLeft:"15px", width: "100%"}}>
                  <MDBModalTitle style={{color:"white", fontFamily:"var(--font-montserrat)"}}>{title}</MDBModalTitle>
                  <div style={{marginTop: "10px"}}>
                    <p style={{color:"white", fontFamily:"var(--font-montserrat)", marginBottom:"7px"}}>Session Times:</p>
                    {sessionTimeArray.map((session) => (
                      <input type="button" className="popup-button" value={session.sessionTime} onClick={() => setTime(session.sessionTime)}/>
                    ))}
                  </div>
                  <div className="submitReservation">
                      <p style={{fontFamily:"var(--font-montserrat)", color: "white"}}>Number of Tickets:
                      {sessionTicketAvailable>0 && <input type="number" min="0" max={sessionTicketAvailable} value={ticket} onChange={handleTicketChange} className="ticket-number" style={{display: "inline", marginLeft: "10px"}}/>}
                      {sessionTicketAvailable!=null && <p style={{display: "inline", marginLeft: "10px"}}>{ticketAvailable}</p>}
                      </p>
                    <p style={{marginTop:"-15px", fontFamily:"var(--font-montserrat)", color: "white"}}>Time: {time}</p>
                    <p style={{marginTop:"-10px", fontFamily:"var(--font-montserrat)", color: "white"}}>Total Price: ${Number.isNaN(ticket) ? <span>0</span> : <span>{ticket * 20}</span>}</p>
                    {errorMessage !== null &&
                      <div className="form-container">
                        <span className="text-danger">{reservationErrorMessage}</span>
                      </div>
                    }
                    {sessionTicketAvailable>0 && <input type="button" className="submit-btn" value="RESERVE" onClick={async (event) => {await handleSubmit(event, time, ticket); setTicket(0); setTime(''); }}/>}
                  </div>
                </div>
                <div style={{marginLeft:"15px"}}>
                <MDBBtn
                  className="btn-close"
                  color="none"
                  onClick={toggleShowMovie}
                  style={{backgroundColor: "white"}}>
                </MDBBtn>
                </div>
              </div>
            </MDBModalBody>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
      </>
    );
  } 
  // MovieCard for displaying movie for review
  else {
    return (
      <>
      <MDBCard className="hover-overlay" onClick={blocked === '0' ? function(event){ toggleShowReview(); handleViewMovie()} : undefined} style = {{cursor: "pointer"}}>
        <img src={imageUrl} position="top" style={{aspectRatio:"2/3", width: "250px", objectFit: "cover"}}/>
        <div className='mask' style={{backgroundColor: 'rgba(0, 0, 0, 0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
          <div>
            <p style={{fontFamily: "var(--font-montserrat)", fontSize: "23px", fontWeight: "600", color: "rgb(255, 255, 255)", textAlign:"center"}}>{title}</p>
            <p style={{fontFamily: "var(--font-montserrat)", fontSize: "15px", fontWeight: "400", color: "rgb(255, 255, 255)", textAlign:"center"}}>Average Rating: {averageRating.toFixed(2)}</p>
            <p style={{fontFamily: "var(--font-montserrat)", fontSize: "15px", fontWeight: "300", color: "rgb(255, 255, 255)", textAlign:"center"}}>{text}</p>
          </div>
        </div>
      </MDBCard>
      <MDBModal show={ReviewModal} setShow={setReviewModal} tabIndex="-1" centered>
        <MDBModalDialog centered style={{maxWidth: "35%"}} size="lg">
          <MDBModalContent style={{ backgroundColor: 'black', border: "2px solid #E50815"}}>
            <MDBModalBody>
            <div className="star-rating">
              {[...Array(5)].map((item, index) => {
                const currRating = index + 1;
                return (
                  <label key={index} onMouseEnter={() => setRating(currRating)}>
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
              <p style={{fontFamily:"var(--font-montserrat)", color: "white"}} >Your rating for the movie is {rating} star</p>
                <h3 style={{color:"red", fontFamily: "var(--font-montserrat)", fontSize: "28px", fontWeight: "600"}}>Your Comment</h3>
                <form onSubmit={handleSubmit}>             
                  <fieldset>
                    <ReactQuill theme="snow" value={post} onChange={setPost} name="post" id="post" />
                    {errorMessage !== null && (<span className="text-danger">{errorMessage}</span>)}
                    <br></br>
                    <input type="submit" className="btn submit-btn" value="POST" style ={{marginRight:"1rem"}} onClick={(event) => handleSubmit(event, rating, title)}/>
                    <input type="button" className="btn submit-btn" value="CANCEL" onClick={toggleShowReview}/>
                  </fieldset>
                </form>
                <div style={{marginLeft:"15px"}}>
              </div>
            </MDBModalBody>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
      </>
    );
  }
}

export default MovieCard