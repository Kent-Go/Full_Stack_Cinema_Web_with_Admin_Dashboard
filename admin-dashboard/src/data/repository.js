// const axios = require("axios");
import axios from "axios"; // comment this out if cannot load

// --- Constants ----------------------------------------------------------------------------------
const API_HOST = "http://localhost:4000";

// Get the movie object from database based on movie title
async function findByMovieTitle(title) {
  const response = await axios.get(API_HOST + "/api/movies/selectByMovieTitle", {params: {title}});
  return response.data;
}

// Get the movies
async function getMovies() {
  const response = await axios.get(API_HOST + "/api/movies");
  return response.data;
}

// Update movie average rating
async function updateMovieAverageRating(id) {
  const response = await axios.put(API_HOST + `/api/movies/updateAverageRating/${id}`); 
  return response.data;
}

// Get Session Time based on movie id
async function getSessionTime(id) {
  const response = await axios.get(API_HOST + `/api/sessions/select/${id}`); 
  return response.data;
}

async function deleteMovie(id) {
  const response = await axios.delete(API_HOST + `/api/movies/delete/${id}`); 
  return response.data;
}

export {
  updateMovieAverageRating,
  getMovies,
  findByMovieTitle,
  getSessionTime, 
  deleteMovie,
}