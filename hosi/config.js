<<<<<<< HEAD
const API_URL = window.location.hostname === "localhost" 
=======
const API_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" 
>>>>>>> 56f5f8a81e106236bdd2771da275a518ba4d6061
    ? "http://localhost:5000" 
    : "https://memorial-hospital-2.onrender.com";