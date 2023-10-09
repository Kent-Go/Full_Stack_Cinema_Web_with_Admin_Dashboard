import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Review from "./Review";
import { Route, BrowserRouter as Router, Routes  } from "react-router-dom";
import { addNewReview, getReviews } from "../data/repository";
import React from "react";

// Global data for tests.
let container;

// Runs before each test, here the SignUp component is rendered and the container is stored.
beforeEach(async () => {
  // Dummy loginUser function in order to run SignUp component for handleSubmit function
  // This is to replace the actual loginUser that set username, email, signupDate to localstorage
  
  const username = "mbolger";
  const utils = render(
    <Router>
      <Routes>
        <Route path="/" element={<Review username={username}/>} />
      </Routes>
    </Router>
    );
    container = utils.container;
});
  
// Test rendering Review component
test("Render Review", () => {
    expect(container).toBeInTheDocument();
});