// ======================================
// AGNES MEMORIAL MEDICAL HOSPITAL
// PATIENT REGISTRATION
// CONNECTED TO MYSQL BACKEND
// ======================================


<<<<<<< HEAD

=======
>>>>>>> 56f5f8a81e106236bdd2771da275a518ba4d6061
console.log("patient.js working");



let registerForm = document.getElementById("registerForm");



if(registerForm){


registerForm.addEventListener("submit", async function(e){


e.preventDefault();



let patient = {


patient_id:
"AMMH" + Math.floor(Math.random()*10000),


name:
document.getElementById("name").value,


email:
document.getElementById("email").value,


phone:
document.getElementById("phone").value,


password:
document.getElementById("password").value


};




try{


let response = await fetch(
<<<<<<< HEAD
"/register",
=======
"http://localhost:5000/register",
>>>>>>> 56f5f8a81e106236bdd2771da275a518ba4d6061
{


method:"POST",


headers:{


"Content-Type":"application/json"


},


body:JSON.stringify(patient)


}

);



let data = await response.json();




if(response.ok){


alert(
"Registration successful"
);


// save temporary login information

localStorage.setItem(
"currentPatient",
JSON.stringify(patient)
);



window.location.href =
"patient-login.html";


}

else{


alert(
data.message || "Registration failed"
);


}



}



catch(error){


console.log(error);


alert(
<<<<<<< HEAD
"Cannot connect to hospital server."
=======
"Cannot connect to hospital server. Ensure server.js is running."
>>>>>>> 56f5f8a81e106236bdd2771da275a518ba4d6061
);


}



});


}