// =====================================
// AGNES MEMORIAL MEDICAL HOSPITAL
// BACKEND SERVER (FULL & COMPLETE VERSION)
// Created by Michael Munguti (Dedan Kimathi University of Technology)
// =====================================

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const db = require("./database");

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || "agnes_hospital_secret_key";

// ================================
// MIDDLEWARE
// ================================

app.use(cors());
app.use(express.json());

// Token Verification Middleware
const verifyToken = (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1];
    if (!token) return res.status(403).json({ message: "No token provided" });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: "Unauthorized access" });
        req.user = decoded;
        next();
    });
};

// ================================
// HELPER: EXACT KENYA DATE ONLY (NO TIME)
// ================================
const getKenyaDate = () => {
    return new Date().toLocaleDateString("en-GB", { 
        timeZone: "Africa/Nairobi", 
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    });
};

// ================================
// SERVE FRONTEND PORTALS & STATIC FILES
// ================================
app.use('/hosi', express.static(path.join(__dirname, '../hosi')));
app.use('/sue', express.static(path.join(__dirname, '../sue')));
app.use('/patient', express.static(path.join(__dirname, '../patient')));

// Mirror root static mapping so un-prefixed relative assets load cleanly
app.use(express.static(path.join(__dirname, '../sue')));

// ================================
// ROOT ROUTE: SERVE SUE PORTAL HOMEPAGE
// ================================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, '../sue', 'index.html'));
});

app.get("/portals", (req, res) => {
    res.json({
        message: "Agnes Memorial Hospital Portals",
        portals: {
            hosi: "/hosi/",
            sue: "/sue/",
            patient: "/patient/"
        }
    });
});

// ================================
// REGISTER USER (Web Account Sign-up)
// ================================

app.post("/register", async (req, res) => {
    const { patient_id, name, username, email, phone, password, role } = req.body;

    const userEmail = email || (username ? `${username}@agneshospital.local` : null);
    const userName = name || username || "Valued User";

    if (!userEmail || !password) {
        return res.status(400).json({ message: "Missing required fields (Email/Username and Password are required)" });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const assignedId = patient_id || "AMMH" + Math.floor(1000 + Math.random() * 9000);

        const sql = `
            INSERT INTO users (patient_id, name, email, phone, password)
            VALUES (?, ?, ?, ?, ?)
        `;

        db.query(sql, [assignedId, userName, userEmail, phone || "", hashedPassword], (err, result) => {
            if (err) {
                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(400).json({ message: "Email or User ID already registered" });
                }
                console.error("Registration Database Error:", err);
                return res.status(500).json({ message: "Registration failed due to a database error" });
            }
            res.status(201).json({ message: "User registered successfully", patient_id: assignedId });
        });
    } catch (error) {
        console.error("Server Register Exception:", error);
        res.status(500).json({ message: "Server error during registration" });
    }
});

// ================================
// LOGIN USER / PATIENT
// ================================

app.post("/login", (req, res) => {
    const { email, username, password } = req.body;
    const searchIdentifier = email || username;

    if (!searchIdentifier || !password) {
        return res.status(400).json({ message: "Email/Username and password required" });
    }

    db.query("SELECT * FROM users WHERE email = ? OR patient_id = ?", [searchIdentifier, searchIdentifier], (err, result) => {
        if (err) {
            console.error("Login Query Error (users):", err);
            return res.status(500).json({ message: "Database error during login check" });
        }

        if (result && result.length > 0) {
            return processUserLogin(result[0], password, res);
        }

        db.query("SELECT * FROM patients WHERE email = ? OR patient_id = ?", [searchIdentifier, searchIdentifier], (pErr, pResult) => {
            if (pErr) {
                console.error("Login Query Error (patients):", pErr);
                return res.status(500).json({ message: "Database error during login check" });
            }

            if (!pResult || pResult.length === 0) {
                return res.status(400).json({ message: "Invalid login details" });
            }

            return processUserLogin(pResult[0], password, res);
        });
    });
});

async function processUserLogin(user, password, res) {
    try {
        if (!user.password) {
            return res.status(400).json({ message: "No web password configured for this account. Please register first." });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid login details" });
        }

        const token = jwt.sign(
            { id: user.id, patient_id: user.patient_id, email: user.email },
            JWT_SECRET,
            { expiresIn: "24h" }
        );

        const safeUser = { ...user };
        delete safeUser.password;

        res.json({
            message: "Login successful",
            token,
            user: safeUser,
            patient: safeUser
        });
    } catch (bcryptErr) {
        console.error("Bcrypt Compare Error:", bcryptErr);
        res.status(500).json({ message: "Internal server error during authentication" });
    }
}

// ================================
// GET PATIENTS (Hospital Managed Only)
// ================================

app.get(["/patients", "/api/patients"], (req, res) => {
    db.query("SELECT * FROM patients ORDER BY id DESC", (err, result) => {
        if (err) {
            console.warn("Patients table missing or empty, returning empty list.");
            return res.json([]);
        }
        res.json(result);
    });
});

app.get("/api/patients/count", (req, res) => {
    db.query("SELECT COUNT(*) AS totalPatients FROM patients", (err, results) => {
        if (err) {
            console.warn("Error fetching patient count:", err);
            return res.json({ totalPatients: 0 });
        }
        res.json({ totalPatients: results[0]?.totalPatients || 0 });
    });
});

app.post("/patients", (req, res) => {
    const { patient_id, name, age, gender, phone, email, address, status, registered } = req.body;
    const assignedId = patient_id || "AMMH" + Math.floor(1000 + Math.random() * 9000);
    const regDate = registered || getKenyaDate();

    const sql = `
        INSERT INTO patients (patient_id, name, age, gender, phone, email, address, status, registered)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [assignedId, name, age || null, gender || null, phone, email, address || null, status || "Active", regDate], (err, result) => {
        if (err) {
            console.error("Add Patient Error:", err);
            return res.status(500).json({ message: "Failed to add patient", error: err.message });
        }
        res.status(201).json({ message: "Patient registered by hospital successfully", id: result.insertId });
    });
});

app.delete("/patients/:id", (req, res) => {
    db.query("DELETE FROM patients WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ message: "Deletion failed" });
        res.json({ message: "Patient record deleted successfully" });
    });
});

// ================================
// SAVE APPOINTMENT
// ================================

app.post("/appointments", (req, res) => {
    const { patient_id, patient_name, email, department, staff, date, time, reason, status } = req.body;

    const sql = `
        INSERT INTO appointments
        (patient_id, patient_name, email, department, staff, date, time, reason, status, deleted_by_hospital, deleted_by_patient)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0)
    `;

    db.query(sql, [patient_id, patient_name, email, department, staff, date, time, reason, status || "Pending"], (err, result) => {
        if (err) {
            console.error("Appointment Insert Error:", err);
            return res.status(500).json({ message: "Appointment creation failed" });
        }

        const appointmentId = result.insertId;
        const notifDateStr = getKenyaDate();
        const notifSql = `
            INSERT INTO notifications (patient_id, title, message, user_type, created_at, status) 
            VALUES (?, ?, ?, 'Patient', ?, 'unread')
        `;
        const notifTitle = "Appointment Booked";
        const notifMsg = `Your appointment for ${date} has been submitted successfully.`;

        db.query(notifSql, [patient_id, notifTitle, notifMsg, notifDateStr], (nErr) => {
            if (nErr) console.error("Auto-notification error:", nErr);

            res.status(201).json({
                message: "Appointment saved successfully",
                id: appointmentId
            });
        });
    });
});

app.get("/patient-appointments/:id", (req, res) => {
    const patient_id = req.params.id;

    db.query(
        "SELECT * FROM appointments WHERE patient_id=? AND COALESCE(deleted_by_patient, 0) = 0 ORDER BY id DESC",
        [patient_id],
        (err, result) => {
            if (err) {
                console.warn("Patient appointments table missing or empty.");
                return res.json([]);
            }
            res.json(result);
        }
    );
});

app.get(["/appointments", "/api/appointments"], (req, res) => {
    db.query("SELECT * FROM appointments WHERE COALESCE(deleted_by_hospital, 0) = 0 ORDER BY id DESC", (err, result) => {
        if (err) {
            console.warn("Appointments table missing or empty.");
            return res.json([]);
        }
        res.json(result);
    });
});

app.put("/cancel-appointment/:id", (req, res) => {
    const { id } = req.params;

    db.query(
        "UPDATE appointments SET status='Cancelled' WHERE id=?",
        [id],
        (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ message: "Cancellation failed" });
            }
            res.json({ message: "Appointment cancelled" });
        }
    );
});

// ==========================================
// PATIENT NOTIFICATIONS
// ==========================================

app.post("/notifications", (req, res) => {
    const { patient_id, title, message, user_type } = req.body;
    const currentDate = getKenyaDate();

    const sql = `
        INSERT INTO notifications (patient_id, title, message, user_type, created_at, status) 
        VALUES (?, ?, ?, ?, ?, 'unread')
    `;

    db.query(sql, [patient_id, title, message, user_type || "Patient", currentDate], (err, result) => {
        if (err) {
            console.error("Error saving notification:", err);
            return res.status(500).json({ message: "Failed to create notification" });
        }
        res.status(201).json({ message: "Notification sent successfully", id: result.insertId });
    });
});

app.get("/notifications/:id", (req, res) => {
    const patient_id = req.params.id;

    db.query(
        "SELECT * FROM notifications WHERE patient_id=? ORDER BY id DESC",
        [patient_id],
        (err, result) => {
            if (err) {
                console.warn("Notifications table missing or empty.");
                return res.json([]);
            }
            res.json(result);
        }
    );
});

app.put("/notifications/mark-read/:id", (req, res) => {
    db.query("UPDATE notifications SET status = 'read' WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ message: "Update failed" });
        res.json({ message: "Notification marked as read" });
    });
});

app.delete("/notifications/:id", (req, res) => {
    db.query("DELETE FROM notifications WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ message: "Deletion failed" });
        res.json({ message: "Notification deleted" });
    });
});

// ==========================================
// HOSPITAL NOTIFICATIONS
// ==========================================

app.post("/hospital-notifications", (req, res) => {
    const { patient_name, staff, date, type } = req.body;
    const currentDate = getKenyaDate();

    const sql = `
        INSERT INTO hospital_notifications 
        (patient_name, staff, date, created_at, type, is_read) 
        VALUES (?, ?, ?, ?, ?, 0)
    `;

    db.query(sql, [patient_name, staff, date, currentDate, type || "Appointment Request"], (err, result) => {
        if (err) {
            console.error("Error saving hospital notification:", err);
            return res.status(500).json({ message: "Failed to log hospital notification" });
        }
        res.status(201).json({ message: "Hospital notification created", id: result.insertId });
    });
});

app.get("/hospital-notifications", (req, res) => {
    db.query("SELECT * FROM hospital_notifications ORDER BY id DESC", (err, results) => {
        if (err) {
            console.warn("Hospital notifications table missing or empty.");
            return res.json([]);
        }
        res.json(results);
    });
});

app.put("/hospital-notifications/mark-read/:id", (req, res) => {
    db.query("UPDATE hospital_notifications SET is_read = 1 WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ message: "Update failed" });
        res.json({ message: "Hospital notification marked as read" });
    });
});

app.delete("/hospital-notifications/:id", (req, res) => {
    db.query("DELETE FROM hospital_notifications WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ message: "Deletion failed" });
        res.json({ message: "Hospital notification deleted" });
    });
});

// ================================
// DOCTORS & NURSES
// ================================

app.get(["/doctors", "/api/doctors"], (req, res) => {
    db.query("SELECT * FROM doctors ORDER BY id DESC", (err, result) => {
        if (err) {
            console.warn("Doctors table missing or empty.");
            return res.json([]);
        }
        res.json(result);
    });
});

app.post("/doctors", (req, res) => {
    const { doctor_id, name, specialization, department, phone, email, availability } = req.body;
    const sql = `INSERT INTO doctors (doctor_id, name, specialization, department, phone, email, availability) VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.query(sql, [doctor_id, name, specialization, department, phone, email, availability], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Doctor registration failed" });
        }
        res.status(201).json({ message: "Doctor registered successfully", id: result.insertId });
    });
});

app.delete("/doctors/:id", (req, res) => {
    db.query("DELETE FROM doctors WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ message: "Deletion failed" });
        res.json({ message: "Doctor deleted successfully" });
    });
});

app.get(["/nurses", "/api/nurses"], (req, res) => {
    db.query("SELECT * FROM nurses ORDER BY id DESC", (err, result) => {
        if (err) {
            console.warn("Nurses table missing or empty.");
            return res.json([]);
        }
        res.json(result);
    });
});

app.post("/nurses", (req, res) => {
    const { nurse_id, name, department, phone, email, shift, status } = req.body;
    const sql = `INSERT INTO nurses (nurse_id, name, department, phone, email, shift, status) VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.query(sql, [nurse_id, name, department, phone, email, shift, status || "Active"], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ message: "Nurse registration failed" });
        }
        res.status(201).json({ message: "Nurse registered successfully", id: result.insertId });
    });
});

app.delete("/nurses/:id", (req, res) => {
    db.query("DELETE FROM nurses WHERE id = ?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ message: "Deletion failed" });
        res.json({ message: "Nurse deleted successfully" });
    });
});

// =========================================================
// LABORATORY, PHARMACY, BILLING & RECORDS ROUTES
// =========================================================

app.get(["/laboratory", "/api/laboratory"], (req, res) => {
    db.query("SELECT * FROM laboratory ORDER BY id DESC", (err, result) => {
        if (err) {
            console.warn("Laboratory table missing or uninitialized, returning empty array.");
            return res.json([]);
        }
        res.json(result);
    });
});

app.post("/laboratory", (req, res) => {
    const { patient_id, patient_name, test_name, result, status, cost, date } = req.body;
    const sql = `INSERT INTO laboratory (patient_id, patient_name, test_name, result, status, cost, date) VALUES (?, ?, ?, ?, ?, ?, ?)`;
    
    db.query(sql, [patient_id, patient_name, test_name, result || 'Pending', status || 'Pending', cost || 0, date || getKenyaDate()], (err, dbResult) => {
        if (err) return res.status(500).json({ message: "Failed to add lab record" });
        res.status(201).json({ message: "Lab test recorded successfully", id: dbResult.insertId });
    });
});

app.get(["/pharmacy", "/api/pharmacy"], (req, res) => {
    db.query("SELECT * FROM pharmacy ORDER BY id DESC", (err, result) => {
        if (err) {
            console.warn("Pharmacy table missing or uninitialized, returning empty array.");
            return res.json([]);
        }
        res.json(result);
    });
});

app.post("/pharmacy", (req, res) => {
    const { medicine_name, category, quantity, price, expiry_date } = req.body;
    const sql = `INSERT INTO pharmacy (medicine_name, category, quantity, price, expiry_date) VALUES (?, ?, ?, ?, ?)`;
    
    db.query(sql, [medicine_name, category, quantity || 0, price || 0, expiry_date], (err, dbResult) => {
        if (err) return res.status(500).json({ message: "Failed to add medicine" });
        res.status(201).json({ message: "Medicine added successfully", id: dbResult.insertId });
    });
});

app.get(["/billing", "/api/billing"], (req, res) => {
    db.query("SELECT * FROM billing ORDER BY id DESC", (err, result) => {
        if (err) {
            console.warn("Billing table missing or uninitialized, returning empty array.");
            return res.json([]);
        }
        res.json(result);
    });
});

app.post("/billing", (req, res) => {
    const { patient_id, patient_name, amount, status, date } = req.body;
    const sql = `INSERT INTO billing (patient_id, patient_name, amount, status, date) VALUES (?, ?, ?, ?, ?)`;
    
    db.query(sql, [patient_id, patient_name, amount, status || 'Unpaid', date || getKenyaDate()], (err, dbResult) => {
        if (err) return res.status(500).json({ message: "Failed to create bill" });
        res.status(201).json({ message: "Billing record saved successfully", id: dbResult.insertId });
    });
});

app.get(["/records", "/api/records", "/medical-records"], (req, res) => {
    db.query("SELECT * FROM records ORDER BY id DESC", (err, result) => {
        if (err) {
            db.query("SELECT * FROM medical_records ORDER BY id DESC", (err2, result2) => {
                if (err2) {
                    console.warn("Records and medical_records tables missing or uninitialized, returning empty array.");
                    return res.json([]);
                }
                return res.json(result2);
            });
            return;
        }
        res.json(result);
    });
});

app.post("/records", (req, res) => {
    const { patient_id, patient_name, diagnosis, prescription, doctor_name, date } = req.body;
    const sql = `INSERT INTO records (patient_id, patient_name, diagnosis, prescription, doctor_name, date) VALUES (?, ?, ?, ?, ?, ?)`;
    
    db.query(sql, [patient_id, patient_name, diagnosis, prescription, doctor_name, date || getKenyaDate()], (err, dbResult) => {
        if (err) return res.status(500).json({ message: "Failed to save medical record" });
        res.status(201).json({ message: "Medical record saved successfully", id: dbResult.insertId });
    });
});

// =========================================================
// APPOINTMENT UPDATE WITH CROSS-PORTAL SYNC
// =========================================================

app.post("/hospital-update-appointment/:id", (req, res) => {
    const appointmentId = req.params.id;
    const { status, staff_name, department } = req.body;
    const notifDateStr = getKenyaDate();

    db.query(
        `UPDATE appointments SET status = ?, staff = ?, department = ? WHERE id = ?`,
        [status, staff_name, department, appointmentId],
        (err) => {
            if (err) {
                console.error("Update Error:", err);
                return res.status(500).json({ message: "Hospital update failed" });
            }

            db.query(`SELECT patient_id FROM appointments WHERE id = ?`, [appointmentId], (err, searchResult) => {
                if (err || searchResult.length === 0) {
                    return res.json({ message: "Updated successfully" });
                }

                const targetPatient = searchResult[0].patient_id;
                const title = `Appointment Status Updated`;
                const message = `Your appointment status has been updated to "${status}" by ${staff_name || 'Hospital Staff'}.`;

                db.query(
                    `INSERT INTO notifications (patient_id, title, message, user_type, created_at, status) VALUES (?, ?, ?, 'Patient', ?, 'unread')`,
                    [targetPatient, title, message, notifDateStr],
                    (notificationErr) => {
                        if (notificationErr) console.error("Failed to log tracking alert:", notificationErr);

                        res.json({
                            message: "Hospital portal changes synchronized successfully",
                            appointmentId
                        });
                    }
                );
            });
        }
    );
});

app.delete("/delete-appointment/:id", (req, res) => {
    db.query("DELETE FROM appointments WHERE id=?", [req.params.id], (err) => {
        if (err) return res.status(500).json({ message: "Deletion failed" });
        res.json({ message: "Appointment deleted permanently" });
    });
});

app.delete("/hospital-delete-appointment/:id", (req, res) => {
    db.query("UPDATE appointments SET deleted_by_hospital = 1 WHERE id = ?", [req.params.id], (err) => {
        if (err) {
            console.error("Hospital soft-delete error:", err);
            return res.status(500).json({ message: "System deletion failed" });
        }
        res.json({ message: "Appointment deleted from hospital portal" });
    });
});

app.delete("/patient-delete-appointment/:id", (req, res) => {
    db.query("UPDATE appointments SET deleted_by_patient = 1 WHERE id = ?", [req.params.id], (err) => {
        if (err) {
            console.error("Patient soft-delete error:", err);
            return res.status(500).json({ message: "System deletion failed" });
        }
        res.json({ message: "Appointment deleted from patient portal" });
    });
});

app.put("/appointments/:id/status", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    db.query("UPDATE appointments SET status = ? WHERE id = ?", [status, id], (err) => {
        if (err) {
            console.error("Error updating appointment system status:", err);
            return res.status(500).json({ message: "Database update failed" });
        }
        res.json({ message: `Appointment status set to ${status}` });
    });
});

// ================================
// START SERVER (Safe for Vercel & Local)
// ================================

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "production") {
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running locally on port ${PORT}`);
    });
}

// Required for Vercel Serverless Functions routing
module.exports = app;