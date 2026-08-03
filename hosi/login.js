// =====================================
// AGNES MEMORIAL MEDICAL HOSPITAL
// LOGIN + REGISTER SYSTEM (FINAL PRODUCTION)
// =====================================

// DYNAMIC API URL CONFIGURATION (Pulls from config.js or auto-detects)
const ACTIVE_API_URL = typeof API_URL !== 'undefined' ? API_URL : (
    window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.protocol === "file:"
        ? "http://localhost:5000" 
        : ""
);

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

    const fullnameEl = getEl("fullname");
    const regUsernameEl = getEl("registerUsername");
    const emailEl = getEl("email");
    const regPasswordEl = getEl("registerPassword");
    const regRoleEl = getEl("registerRole");
    const regMessageEl = getEl("registerMessage");

    let user = {
        name: fullnameEl && fullnameEl.value ? fullnameEl.value.trim() : "",
        username: regUsernameEl && regUsernameEl.value ? regUsernameEl.value.trim() : "",
        email: emailEl && emailEl.value ? emailEl.value.trim() : "",
        password: regPasswordEl && regPasswordEl.value ? regPasswordEl.value : "",
        role: regRoleEl && regRoleEl.value && regRoleEl.value !== "Select Role" ? regRoleEl.value : ""
    };

    if (!user.name || !user.username || !user.email || !user.password || !user.role) {
        if (regMessageEl) regMessageEl.innerHTML = "Please fill in all registration fields and select a role.";
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
        if (regMessageEl) regMessageEl.innerHTML = "Server connection error. Please check server.";
        console.error("Register catch error:", error);
    }
});

// 4. LOGIN USER SUBMISSION HANDLER
safeAddListener("loginForm", "submit", async function(e) {
    e.preventDefault();

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
                sessionStorage.setItem("currentUser", JSON.stringify(data.user || credentials));
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
        if (loginMessageEl) loginMessageEl.innerHTML = "Server connection error. Please check server.";
        console.error("Login catch error:", error);
    }
});