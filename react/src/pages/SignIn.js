import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { verifyUser } from "../data/repository";
import '../pages/pagesCSS/SignIn.css';

/**
 * SignIn component.
 * @param {loginUser} props.loginUser - loginUser function from App.js
 */
function SignIn(props) {
  const [fields, setFields] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState(null);
  const [emailErrorMessage, setEmailErrorMessage] = useState(null);
  const navigate = useNavigate();

  // Generic change handler.
  const handleInputChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;

    // Copy email and password fields into temp
    const temp = { email: fields.email, password: fields.password };

    // Update field and state.
    temp[name] = value;
    setFields(temp);
  }

  /**
   * Sign In handler.
   * @param {*} event 
   * @returns Profile page if sign in is successful
   */
  const handleSubmit = async (event) => {
    event.preventDefault();

    // Set variable for sign-in error due to fail validation
    var signInError = false;

    // Check if email and password are empty
    if (fields.username === "" || fields.password === "") {
      setErrorMessage("Please fill in all the required fields.");
      signInError = true;
    }
    else if (fields.username !== "" && fields.email !== "" && fields.password !== "" && errorMessage !== null) {
      setErrorMessage(null);
    }

    // Email Validation (checking if it includes @, ends with .com, and has a domain name)
    if (!fields.email.includes("@") || !fields.email.endsWith(".com") || fields.email.indexOf("@") === fields.email.indexOf(".") - 1) {
      setEmailErrorMessage("Please enter a valid email address.");
      signInError = true;
    }
    else if (fields.email.includes("@") && fields.email.endsWith(".com") && fields.email.indexOf("@") !== fields.email.indexOf(".") - 1 && emailErrorMessage !== null) {
      setEmailErrorMessage(null);
    }

    // Terminate handleSubmit if fail validation
    if (signInError === true) {
      return;
    }

    // Get boolean true or false from verifyUser
    const user = await verifyUser(fields.email, fields.password);

    if(user === null) {
      // Reset password field to blank.
      setFields({ ...fields, password: "" });

      // Set error message.
      setErrorMessage("Email and / or password invalid, please try again.");
      return;
    }

    // Set user state.
    props.loginUser(fields.email);

    // Provide sign in success visual cue
    alert('Sign In Successfull!');
    // Navigate to the profile page.
    navigate("/profile");
    return;
  }

  return (
    <section className="signin-section">
      <div className="signin-container">
        <h1>Sign In</h1>
        <div className="signin-row">
            <form onSubmit={handleSubmit}>
              <div className="form-container">
                <label htmlFor="email">Email</label>
                <input name="email" id="email" 
                  value={fields.email} onChange={handleInputChange} />
              </div>
              {emailErrorMessage !== null &&
                <div className="form-container">
                  <span className="text-danger">{emailErrorMessage}</span>
                </div>
              }
              <div className="form-container">
                <label htmlFor="password">Password</label>
                <input type="password" name="password" id="password" 
                  value={fields.password} onChange={handleInputChange} />
              </div>
              <div className="form-container">
                  <input type="submit" className="btn submit-btn" value="SIGN IN" />
              </div>
              {errorMessage !== null &&
                <div className="form-container">
                  <span className="text-danger">{errorMessage}</span>
                </div>
              }
              <div className="form-container">
                <p className="signup-prompt">New to Loop Cinemas?</p>
                  <Link className="btn submit-btn" to="/sign-up">SIGN UP</Link>
              </div>
            </form>
        </div>
      </div>
    </section>
  );
}

export default SignIn;