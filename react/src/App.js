import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./fragments/Navbar";
import Footer from "./fragments/Footer";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import MyProfile from "./pages/MyProfile";
import Review from "./pages/Review";
import SignUp from "./pages/SignUp";
import { getUserByEmail, removeUser } from "./data/repository";

function App() {
  const [username, setUsername] = useState(localStorage.getItem("username") || null);
  const [email, setEmail] = useState(localStorage.getItem("email") || null);
  const [signupDate, setSignUpDate] = useState(localStorage.getItem("signupDate") || null);

  // login user function
  const loginUser = async (email) => {
    // Retrieve user from database
    const user = await getUserByEmail(email);
    setUsername(user.username);
    setEmail(user.email);
    setSignUpDate(user.signUpDate);

    // Store user data in localStorage to prevent loss of data on page refresh
    localStorage.setItem("username", user.username);
    localStorage.setItem("email", user.email);
    localStorage.setItem("signupDate", user.signUpDate);
  }

  // logout user function
  const logoutUser = () => {
    removeUser();
    setUsername(null);
    setEmail(null);
    setPassword(null);
    setSignUpDate(null);
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <Router>
        <Navbar username={username} logoutUser={logoutUser}/>
        <main>
          <div className="">
            <Routes>
              <Route path="/" element={<Home username={username} />} />
              <Route path="/sign-in" element={<SignIn loginUser={loginUser} />} />
              <Route path="/sign-up" element={<SignUp loginUser={loginUser} />} />
              <Route path="/profile" element={<MyProfile username={username} email={email} signupDate={signupDate}/>} />
              <Route path="/review" element={<Review username={username} />} />
            </Routes>
          </div>
        </main>
        <Footer />
      </Router>
    </div>
  );
}

export default App;
