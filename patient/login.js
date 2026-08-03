// ======================================
// AGNES MEMORIAL MEDICAL HOSPITAL
// PATIENT LOGIN SYSTEM
// ======================================

async function loginUser() {
    let email = document.getElementById("loginemail").value.trim();
    let password = document.getElementById("loginpassword").value;

    if (email === "" || password === "") {
        alert("Email or password should not be blank");
        return;
    }

    try {
        let response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        let data = await response.json();

        if (!response.ok) {
            alert(data.message || "Login failed. Please check your credentials.");
            return;
        }

        // Save patient information if returned by the backend
        if (data.patient) {
            localStorage.setItem("loggedPatient", JSON.stringify(data.patient));
            localStorage.setItem("currentPatient", JSON.stringify(data.patient));
            localStorage.setItem("currentUser", JSON.stringify(data.patient));
        }

        alert("Login successful!");
        document.getElementById("loginpage").style.display = "none";
        document.getElementById("websitepage").style.display = "block";

    } catch (error) {
        console.error("Network or server error:", error);
        alert("Unable to connect to the server. Please try again later.");
    }
}

let loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function(e) {
        e.preventDefault();

        let email = document.getElementById("loginEmail").value.trim();
        let password = document.getElementById("loginPassword").value.trim();

        if (email === "" || password === "") {
            alert("Please enter email and password");
            return;
        }

        try {
            let response = await fetch('/login', {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, password })
            });

            let data = await response.json();

            if (response.ok) {
                if (data.patient) {
                    localStorage.setItem("loggedPatient", JSON.stringify(data.patient));
                    localStorage.setItem("currentPatient", JSON.stringify(data.patient));
                    localStorage.setItem("currentUser", JSON.stringify(data.patient));
                }

                alert("Login successful");
                window.location.href = "patient-dashboard.html";
            } else {
                alert(data.message || "Invalid login details");
            }
        } catch (error) {
            console.error(error);
            alert("Cannot connect to server");
        }
    });
}

function goToLoginPage() {
    document.getElementById("frontpage").style.display = "none";
    document.getElementById("loginpage").style.display = "block";
}

function goToRegisterPage() {
    document.getElementById("frontpage").style.display = "none";
    document.getElementById("registerpage").style.display = "block";
}

function goToResetPage() {
    document.getElementById("loginpage").style.display = "none";
    document.getElementById("resetpage").style.display = "block";
}

function goToVerifyPage() {
    let phone = document.getElementById("resetphone").value.trim();
    let password = document.getElementById("newpassword").value;
    let newpassword = document.getElementById("oldpassword").value;

    if (phone === "" || password === "") {
        alert("Spaces cannot be blank");
        return;
    }
    if (password !== newpassword) {
        alert("Passwords must be the same");
        return;
    }
    if (password.length < 6) {
        alert("Password must be at least 6 digits long");
        return;
    }
    if (phone.length < 10) {
        alert("Your phone number must be 10 digits long");
        return;
    }
    if (!phone.startsWith("01") && !phone.startsWith("07")) {
        alert("Your number should start with 01 or 07");
        return;
    }

    let generatedOTP = Math.floor(Math.random() * 9000) + 1000;
    alert("OTP sent successfully!\nYour OTP is: " + generatedOTP);

    document.getElementById("resetpage").style.display = "none";
    document.getElementById("verifypage").style.display = "block";
}

function returnToLoginPage() {
    let code = document.getElementById("verifycode").value.trim();
    if (code === "") {
        alert("The OTP is required");
        return;
    }

    alert("Your password was successfully changed");
    document.getElementById("verifypage").style.display = "none";
    document.getElementById("loginpage").style.display = "block";
}

async function backToLoginPage() {
    let firstname = document.getElementById("firstname").value.trim();
    let last = document.getElementById("lastname").value.trim();
    let password = document.getElementById("registerpassword").value;
    let confirm = document.getElementById("registerconfirmpassword").value;
    let email = document.getElementById("registeremail").value.trim();
    let phone = document.getElementById("registerphone").value.trim();

    if (last === "" || password === "" || phone === "" || email === "" || confirm === "" || firstname === "") {
        alert("Ensure you fill all the spaces");
        return;
    }
    if (password !== confirm) {
        alert("Passwords must be the same");
        return;
    }

    try {
        let response = await fetch('/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ firstname, last, email, phone, password })
        });

        alert("Registration successful!");
        document.getElementById("registerpage").style.display = "none";
        document.getElementById("loginpage").style.display = "block";

    } catch (error) {
        console.error("Registration error:", error);
        alert("Registration saved locally, but check server connection.");
        document.getElementById("registerpage").style.display = "none";
        document.getElementById("loginpage").style.display = "block";
    }
}

function showMenu() {
    let menu = document.getElementById("menu");
    if (menu.style.display === "none" || menu.style.display === "") {
        menu.style.display = "block";
    } else {
        menu.style.display = "none";
    }
}

function showCategory(categoryId) {
    let categories = document.getElementsByClassName("category");
    for (let i = 0; i < categories.length; i++) {
        categories[i].style.display = "none";
    }
    document.getElementById(categoryId).style.display = "block";
}