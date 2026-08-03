// =====================================
// AGNES MEMORIAL MEDICAL HOSPITAL
<<<<<<< HEAD
// LOGIN + REGISTER SYSTEM (FINAL PRODUCTION)
// =====================================

// DYNAMIC API URL CONFIGURATION (Pulls from config.js or auto-detects)
const ACTIVE_API_URL = typeof API_URL !== 'undefined' ? API_URL : (
    window.location.hostname === "localhost" 
        ? "http://localhost:5000" 
        : "https://memorial-hospital-2.onrender.com"
);
=======
// LOGIN + REGISTER SYSTEM (LOCAL & PROD DUAL-MODE)
// =====================================

// DYNAMIC API URL: Forces localhost when testing on PC via file:// or localhost
const ACTIVE_API_URL = (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.protocol === "file:")
    ? "http://localhost:5000"
    : "https://memorial-hospital-2.onrender.com";
>>>>>>> 56f5f8a81e106236bdd2771da275a518ba4d6061

// SAFE ELEMENT RETRIEVAL HELPER
function getEl(id) {
    try {
        return document.getElementById(id);
    } catch (err) {
        console.warn(`DOM lookup failed for ID: ${id}`);
        return null;
    }
}

// SAFE EVENT ATTACHMENT HELPER
function safeAddListener(elementId, eventType, callback) {
    const element = getEl(elementId);
    if (element) {
        element.addEventListener(eventType, callback);
    }
}

// 1. SWITCH TO REGISTER VIEW
const showRegisterBtn = getEl("showRegister");
if (showRegisterBtn) {
    showRegisterBtn.onclick = function() {
        const loginFormEl = getEl("loginForm");
        const registerFormEl = getEl("registerForm");
        const formTitleEl = getEl("formTitle");

        if (loginFormEl) loginFormEl.style.display = "none";
        if (registerFormEl) registerFormEl.style.display = "block";
        if (formTitleEl) formTitleEl.innerHTML = "Create Hospital Account";
    };
}

// 2. SWITCH TO LOGIN VIEW
const showLoginBtn = getEl("showLogin");
if (showLoginBtn) {
    showLoginBtn.onclick = function() {
        const registerFormEl = getEl("registerForm");
        const loginFormEl = getEl("loginForm");
        const formTitleEl = getEl("formTitle");

        if (registerFormEl) registerFormEl.style.display = "none";
        if (loginFormEl) loginFormEl.style.display = "block";
        if (formTitleEl) formTitleEl.innerHTML = "Medical Hospital Login";
    };
}

// 3. REGISTER USER SUBMISSION HANDLER
safeAddListener("registerForm", "submit", async function(e) {
    e.preventDefault();

<<<<<<< HEAD
    const fullnameEl = getEl("fullname");
    const regUsernameEl = getEl("registerUsername");
    const emailEl = getEl("email");
    const regPasswordEl = getEl("registerPassword");
    const regRoleEl = getEl("registerRole");
=======
    const fullnameEl = getEl("fullname") || getEl("registerUsername");
    const emailEl = getEl("email");
    const regPasswordEl = getEl("registerPassword");
    const phoneEl = getEl("phone");
>>>>>>> 56f5f8a81e106236bdd2771da275a518ba4d6061
    const regMessageEl = getEl("registerMessage");

    let user = {
        name: fullnameEl && fullnameEl.value ? fullnameEl.value.trim() : "",
<<<<<<< HEAD
        username: regUsernameEl && regUsernameEl.value ? regUsernameEl.value.trim() : "",
        email: emailEl && emailEl.value ? emailEl.value.trim() : "",
        password: regPasswordEl && regPasswordEl.value ? regPasswordEl.value : "",
        role: regRoleEl && regRoleEl.value && regRoleEl.value !== "Select Role" ? regRoleEl.value : ""
    };

    if (!user.name || !user.username || !user.email || !user.password || !user.role) {
        if (regMessageEl) regMessageEl.innerHTML = "Please fill in all registration fields and select a role.";
=======
        email: emailEl && emailEl.value ? emailEl.value.trim() : "",
        password: regPasswordEl && regPasswordEl.value ? regPasswordEl.value : "",
        phone: phoneEl && phoneEl.value ? phoneEl.value.trim() : ""
    };

    if (!user.name || !user.email || !user.password) {
        if (regMessageEl) regMessageEl.innerHTML = "Please fill in all required registration fields.";
>>>>>>> 56f5f8a81e106236bdd2771da275a518ba4d6061
        return;
    }

    if (regMessageEl) regMessageEl.innerHTML = "Creating account...";

    try {
        let response = await fetch(`${ACTIVE_API_URL}/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(user)
        });

        let data = {};
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        }

        if (response.ok) {
            if (regMessageEl) regMessageEl.innerHTML = "Account created successfully! Redirecting to login...";
            const regFormEl = getEl("registerForm");
            if (regFormEl) regFormEl.reset();
            
            setTimeout(() => {
                const showLoginEl = getEl("showLogin");
                if (showLoginEl) showLoginEl.click();
                if (regMessageEl) regMessageEl.innerHTML = "";
            }, 1500);
        } else {
            if (regMessageEl) regMessageEl.innerHTML = data.message || "Registration failed.";
        }
    } catch (error) {
<<<<<<< HEAD
        if (regMessageEl) regMessageEl.innerHTML = "Server connection error. Please wake up or check server.";
=======
        if (regMessageEl) regMessageEl.innerHTML = "Server connection error. Please check if local server is running.";
>>>>>>> 56f5f8a81e106236bdd2771da275a518ba4d6061
        console.error("Register catch error:", error);
    }
});

// 4. LOGIN USER SUBMISSION HANDLER
safeAddListener("loginForm", "submit", async function(e) {
    e.preventDefault();

<<<<<<< HEAD
    const usernameEl = getEl("username");
    const passwordEl = getEl("password");
    const roleEl = getEl("role");
    const loginMessageEl = getEl("loginMessage");

    let credentials = {
        username: usernameEl && usernameEl.value ? usernameEl.value.trim() : "",
        password: passwordEl && passwordEl.value ? passwordEl.value : "",
        role: roleEl && roleEl.value && roleEl.value !== "Select Role" ? roleEl.value : ""
    };

    if (!credentials.username || !credentials.password || !credentials.role) {
        if (loginMessageEl) loginMessageEl.innerHTML = "Please fill in all fields and select a role.";
=======
    const emailEl = getEl("username") || getEl("email");
    const passwordEl = getEl("password");
    const loginMessageEl = getEl("loginMessage");

    let credentials = {
        email: emailEl && emailEl.value ? emailEl.value.trim() : "",
        password: passwordEl && passwordEl.value ? passwordEl.value : ""
    };

    if (!credentials.email || !credentials.password) {
        if (loginMessageEl) loginMessageEl.innerHTML = "Please enter your email and password.";
>>>>>>> 56f5f8a81e106236bdd2771da275a518ba4d6061
        return;
    }

    if (loginMessageEl) loginMessageEl.innerHTML = "Authenticating...";

    try {
        let response = await fetch(`${ACTIVE_API_URL}/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(credentials)
        });

        let data = {};
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        }

        if (response.ok) {
            try {
<<<<<<< HEAD
                sessionStorage.setItem("currentUser", JSON.stringify(data.user || credentials));
=======
                sessionStorage.setItem("currentUser", JSON.stringify(data.patient || credentials));
>>>>>>> 56f5f8a81e106236bdd2771da275a518ba4d6061
                if (data.token) {
                    sessionStorage.setItem("token", data.token);
                }
            } catch (storageErr) {
                console.warn("Session storage restricted:", storageErr);
            }

            if (loginMessageEl) loginMessageEl.innerHTML = "Login successful! Redirecting...";

            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 1000);
        } else {
            if (loginMessageEl) loginMessageEl.innerHTML = data.message || "Invalid login details.";
        }
    } catch (error) {
<<<<<<< HEAD
        if (loginMessageEl) loginMessageEl.innerHTML = "Server connection error. Please wake up or check server.";
=======
        if (loginMessageEl) loginMessageEl.innerHTML = "Server connection error. Please check if local server is running.";
>>>>>>> 56f5f8a81e106236bdd2771da275a518ba4d6061
        console.error("Login catch error:", error);
    }
});