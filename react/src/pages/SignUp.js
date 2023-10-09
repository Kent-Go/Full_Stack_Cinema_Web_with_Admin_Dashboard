import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createUser, findUser, getUserByEmail } from "../data/repository";
import '../pages/pagesCSS/SignIn.css';

/**
 * Sign Up component.
 * @param {loginUser} props.loginUser - loginUser function from App.js
 */
function SignUp(props) {
  const [fields, setFields] = useState({ username: "", email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState(null);
  const [usernameErrorMessage, setUsernameErrorMessage] = useState(null);
  const [emailErrorMessage, setEmailErrorMessage] = useState(null);
  const [passwordErrorMessage, setPasswordErrorMessage] = useState(null);
  
  const navigate = useNavigate();

  // constant variable for sign up date and its format
  const todayDate = new Date();
  const dateFormat = {weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' };

  // Generic change handler.
  const handleInputChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;

    // Copy fields.
    const temp = { username: fields.username, email: fields.email, password: fields.password};

    // Update field and state.
    temp[name] = value;
    setFields(temp);
  }

  /**
   * Sign Up handler.
   * @param {*} event 
   * @navigate Homepage if sign up is successful
   */
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Set variable for sign-up error due to fail validation
    var signUpError = false;

    // Check if username, email, and password are empty
    if (fields.username === "" || fields.email === "" || fields.password === "") {
      setErrorMessage("Please fill in all the required fields.");
      signUpError = true;
      return;
    }
    else if (fields.username !== "" && fields.email !== "" && fields.password !== "" && errorMessage !== null) {
      setErrorMessage(null);
    }

    // Username Validation (checking if username already exist in database)
    if (await findUser(fields.username) !== null) {
      setUsernameErrorMessage("Username is already registered.");
      signUpError = true;
    }
    else if (await findUser(fields.username) === null) {
      setUsernameErrorMessage(null);
    }

    // Email Validation (checking if it includes @, ends with .com, and has a domain name, and if email already exist in database)
    if (!fields.email.includes("@") || !fields.email.endsWith(".com") || fields.email.indexOf("@") === fields.email.indexOf(".") - 1) {
      setEmailErrorMessage("Please enter a valid email address.");
      signUpError = true;
    }
    else if (await getUserByEmail(fields.email) !== null) {
      setEmailErrorMessage("Email address is already registered.");
      signUpError = true;
    }
    else if (fields.email.includes("@") && fields.email.endsWith(".com") && fields.email.indexOf("@") !== fields.email.indexOf(".") - 1 && emailErrorMessage !== null && await getUserByEmail(fields.email) === null) {
      setEmailErrorMessage(null);
    }

    // Password Validation (checking if it is at least 8 characters long)
    if (fields.password.length < 8) {
      setPasswordErrorMessage("Password must be at least 8 characters long.");
      signUpError = true;
    }
    // Password Validation (checking if it contains at least one special character)
    else if (!fields.password.match(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/)) {
      setPasswordErrorMessage("Password must contain at least one special character.");
      signUpError = true;
    }
    else if (fields.password.length >= 8 && fields.password.match(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]+/) && passwordErrorMessage !== null) {
      setPasswordErrorMessage(null);
    }

    // Terminate handleSubmit if fail validation
    if (signUpError === true) {
      return;
    }

    // Create user.
    await createUser({username: fields.username, email: fields.email, password: fields.password, signUpDate: todayDate.toLocaleDateString('en-GB', dateFormat)});
    
    // Set user state.
    props.loginUser(fields.email);

    // Provide sign in success visual cue
    alert('Sign Up Successfull!');
    // Navigate to the profile page.
    navigate("/");
    return;
  }

  return (
    <section className="signin-section">
      <div className="signin-container">
        <h1>Sign Up</h1>
        <div className="signin-row">
            <form onSubmit={handleSubmit} noValidate>
              <div className="form-container">
                <label htmlFor="username">Username</label>
                <input name="username" id="username" value={fields.username} onChange={handleInputChange} required/>
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
              {emailErrorMessage !== null &&
                <div className="form-container">
                  <span className="text-danger">{emailErrorMessage}</span>
                </div>
              }
              <div className="form-container">
                <label htmlFor="password">Password</label>
                <input type="password" name="password" id="password" value={fields.password} onChange={handleInputChange} required/>
              </div>
              {passwordErrorMessage !== null &&
                <div className="form-container">
                  <span className="text-danger">{passwordErrorMessage}</span>
                </div>
              }
              <div className="form-container">
                  <input type="submit" className="btn submit-btn" value="SIGN UP"/>
              </div>
              {errorMessage !== null &&
                <div className="form-container">
                  <span className="text-danger">{errorMessage}</span>
                </div>
              }
              <div className="form-container">
                <p className="signup-prompt">Already have an account?</p>
                <Link className="btn submit-btn" to="/sign-in">Sign In</Link>
              </div>
            </form>
        </div>
      </div>
    </section>
  );
}

export default SignUp;