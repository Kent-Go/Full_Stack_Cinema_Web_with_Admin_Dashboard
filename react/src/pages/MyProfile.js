import React, { useState, useEffect } from "react";
import { updateUser, deleteUser, getUserByEmail, findUser, getUserReservation } from "../data/repository";
import { useNavigate } from "react-router-dom";
import { MDBIcon, MDBBtn, MDBModal, MDBModalDialog, MDBModalContent, MDBModalBody } from 'mdb-react-ui-kit';
import './pagesCSS/MyProfile.css';
import '../pages/pagesCSS/SignIn.css';

/**
 * MyProfile component.
 * @param {loginUser} props.loginUser - loginUser function from App.js
 * @param {String} props.username - username of the current user from App.js
 * @param {String} props.email - email of the current user from App.js
 * @param {Date} props.signUpDate - sign up date of the current user from App.js
 */
function MyProfile(props) {
  const navigate = useNavigate();
  const [fields, setFields] = useState({ username: (props.username), email: (props.email)});
  const [tickets, setTickets] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [usernameErrorMessage, setUsernameErrorMessage] = useState(null);
  const [emailErrorMessage, setEmailErrorMessage] = useState(null);
  const [EditProfileModal, setEditProfileModal] = useState(false);
  const toggleShow = () => setEditProfileModal(!EditProfileModal);

  // Update fields when props change
  useEffect(() => {
    setFields({ username: props.username, email: props.email });
  }, [props.username, props.email]);

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        // Fetch reservations from database
        const reservations = await getUserReservation(props.username);
        setTickets(reservations);
      } catch (error) {
        // Handle errors if needed
        console.error('Error fetching reservations:', error);
      }
    };
    fetchReservation();
  }, []);

  // Implement remove user functionality
  const handleRemoveUser = async (event) => {
    event.preventDefault();
    const confirmDelete = window.confirm("Are you sure you want to delete your profile?");
    if (confirmDelete) {
      // Delete user from database
      deleteUser(props.username)
      // Remove user from localStorage
      props.logoutUser();
      // Visual cue for alerting user profile is deleted
      alert("Your profile is now deleted!");
      // Navigate to the home page.
      navigate("/");
    }
  };

  // Generic change handler.
  const handleInputChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;

    // Copy fields.
    const temp = { username: fields.username, email: fields.email};
    // OR use spread operator.
    // const temp = { ...fields };

    // Update field and state.
    temp[name] = value;
    setFields(temp);
  }

  // Generic submit handler.
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Set variable for edit profile error due to fail validation
    var editProfileError = false;

    // Check if username and email are empty
    if (fields.username === "" || fields.email === "") {
      setErrorMessage("Please fill in all the required fields.");
      editProfileError = true;
      return;
    }
    else if (fields.username !== "" && fields.email !== "" && errorMessage !== null) {
      setErrorMessage(null);
    }

    // Username Validation (checking if username already exist in database)
    if (await findUser(fields.username) !== null && fields.username !== props.username) {
      setUsernameErrorMessage("Username is already registered.");
      editProfileError = true;
    }
    else if (await findUser(fields.username) === null || fields.username === props.username) {
      setUsernameErrorMessage(null);
    }

    // Email Validation (checking if it includes @, ends with .com, and has a domain name, and if email already exist in database)
    if (!fields.email.includes("@") || !fields.email.endsWith(".com") || fields.email.indexOf("@") === fields.email.indexOf(".") - 1) {
      setEmailErrorMessage("Please enter a valid email address.");
      editProfileError = true;
    }
    else if (await getUserByEmail(fields.email) !== null && fields.email !== props.email) {
      setEmailErrorMessage("Email address is already registered.");
      editProfileError = true;
    }
    else if ((fields.email.includes("@") && fields.email.endsWith(".com") && fields.email.indexOf("@") !== fields.email.indexOf(".") - 1 && emailErrorMessage !== null && await getUserByEmail(fields.email) === null) || fields.email === props.email) {
      setEmailErrorMessage(null);
    }

    // Terminate handleSubmit if fail validation
    if (editProfileError === true) {
      return;
    }

    // Update user in database and localStorage
    await updateUser(props.username, fields.username, fields.email); // Wait for updateUser to finish before continuing
    const user = await getUserByEmail(fields.email)
    
    // Set new username and email to local storage
    localStorage.setItem("username", user.username);
    localStorage.setItem("email", user.email);

    // Provide edit profile success visual cue
    alert('Edit Profile Successfull!');
    // Navigate to the profile page.
    navigate("/profile");
    // Refresh page
    navigate(0);
    return;
  }

  return (
    <>
      <section className="profile-section">
        <div className="profile-container">
          <div className="profile-header">
            <h1>My Profile</h1>
            <div className="edit-icons">
              <MDBBtn outline color="light" floating role="button" className="edit-icon" aria-label='edit' onClick={toggleShow}>
                <MDBIcon far icon="edit" style={{ fontSize: "1rem" }} />
              </MDBBtn>
              <MDBBtn outline color="light" floating role="button" className="edit-icon" onClick={handleRemoveUser}>
                <MDBIcon far icon="trash-alt" style={{ fontSize: "1rem" }} />
              </MDBBtn>
            </div>
          </div>
          <h4>Welcome, <strong>{props.username}</strong>!</h4>
          {props.email !== null && (
            <p>
              <strong>Email:</strong> {props.email} <br/> <strong>Joined:</strong> {props.signupDate}
            </p>
          )}
          <div className="profile-header">
            <h2>My Tickets</h2>
          </div>
          {/* If user HAS reserved a ticket*/}
          {tickets && tickets.length > 0 ? 
            (tickets.map((ticket) => (
              <div key={ticket.reservation_id} className="ticket">
                <p>
                  <strong>Movie Title:</strong> {ticket.title} <br/>
                  <strong>Session Time:</strong> {ticket.session_time} <br/>
                  <strong>Number of Tickets:</strong> {ticket.number_tickets} <br/>
                </p>
              </div>
              ))
            ) : (
            <p>No tickets found.</p>
          )}
        </div>
      </section>
      <MDBModal show={EditProfileModal} setShow={setEditProfileModal} tabIndex="-1" centered>
        <MDBModalDialog centered style={{ maxWidth: "35%" }} size="lg">
          <MDBModalContent style={{backgroundColor: "black", border: "2px solid #E50815", borderRadius: "0px",}}>
            <MDBModalBody style={{ padding: "0" }}>
              <section className="signin-section" style={{ padding: "0" }}>
                <div className="signin-container" style={{ margin: "0", width: "auto", border: "none", borderRadius: "0px" }}>
                  <h1>Edit Profile</h1>
                  <div className="signin-row">
                    <form onSubmit={handleSubmit} noValidate>
                      <div className="form-container">
                        <label htmlFor="username">Username</label>
                        <input name="username" id="username" value={fields.username} onChange={handleInputChange} required />
                      </div>
                      {usernameErrorMessage !== null &&
                        <div className="form-container">
                          <span className="text-danger">{usernameErrorMessage}</span>
                        </div>
                      }
                      <div className="form-container">
                        <label htmlFor="email">Email</label>
                        <input type="email" name="email" id="email" required value={fields.email} onChange={handleInputChange}/>
                      </div>
                      {emailErrorMessage !== null && (
                        <div className="form-container">
                          <span className="text-danger">{emailErrorMessage}</span>
                        </div>
                      )}
                      <div className="form-container">
                        <input type="submit" className="btn submit-btn" value="UPDATE" style={{ marginRight: "1rem" }} />
                        <input type="button" className="btn submit-btn" onClick={toggleShow} value="CANCEL"/>
                      </div>
                      {errorMessage !== null && (
                        <div className="form-container">
                          <span className="text-danger">{errorMessage}</span>
                        </div>
                      )}
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

export default MyProfile;