// =======================================
// AGNES MEMORIAL MEDICAL HOSPITAL
// REPORTS DASHBOARD JAVASCRIPT
<<<<<<< HEAD
// =======================================


// Get saved data


let patients =
JSON.parse(localStorage.getItem("patients")) || [];


let doctors =
JSON.parse(localStorage.getItem("doctors")) || [];


let nurses =
JSON.parse(localStorage.getItem("nurses")) || [];


let appointments =
JSON.parse(localStorage.getItem("appointments")) || [];


let laboratory =
JSON.parse(localStorage.getItem("laboratory")) || [];


let medicines =
JSON.parse(localStorage.getItem("medicines")) || [];


let bills =
JSON.parse(localStorage.getItem("bills")) || [];


let records =
JSON.parse(localStorage.getItem("records")) || [];





// =======================================
// DISPLAY TOTALS
// =======================================



document.getElementById("totalPatients").innerHTML =
patients.length;



document.getElementById("totalDoctors").innerHTML =
doctors.length;



document.getElementById("totalNurses").innerHTML =
nurses.length;



document.getElementById("totalAppointments").innerHTML =
appointments.length;



document.getElementById("totalLab").innerHTML =
laboratory.length;



document.getElementById("totalMedicine").innerHTML =
medicines.length;



document.getElementById("totalRecords").innerHTML =
records.length;








// =======================================
// CALCULATE REVENUE
// =======================================


let totalRevenue = 0;



bills.forEach(bill=>{


totalRevenue += Number(bill.amount);


});



document.getElementById("revenue").innerHTML =

"KES " + totalRevenue.toLocaleString();







// =======================================
// ANIMATION COUNTERS
// =======================================


function animateNumber(id,value){


let number=0;


let timer=setInterval(()=>{


number += Math.ceil(value/50);



if(number>=value){


number=value;


clearInterval(timer);


}



document.getElementById(id).innerHTML=number;



},20);


}






animateNumber(
"totalPatients",
patients.length
);



animateNumber(
"totalDoctors",
doctors.length
);



animateNumber(
"totalNurses",
nurses.length
);



animateNumber(
"totalAppointments",
appointments.length
);



animateNumber(
"totalLab",
laboratory.length
);



animateNumber(
"totalMedicine",
medicines.length
);



animateNumber(
"totalRecords",
records.length
);
=======
// Created by Michael Munguti
// =======================================

const BASE_API_URL = "http://localhost:5000";

async function loadReportsData() {
    try {
        const endpoints = [
            "/patients",
            "/doctors",
            "/nurses",
            "/appointments",
            "/laboratory",
            "/pharmacy",
            "/billing",
            "/records"
        ];

        const results = await Promise.all(
            endpoints.map(async (endpoint) => {
                try {
                    const res = await fetch(`${BASE_API_URL}${endpoint}`);
                    if (!res.ok) return [];
                    const data = await res.json();
                    return Array.isArray(data) ? data : [];
                } catch (e) {
                    return [];
                }
            })
        );

        const [
            patientsArr,
            doctorsArr,
            nursesArr,
            appointmentsArr,
            labArr,
            pharmacyArr,
            billingArr,
            recordsArr
        ] = results;

        console.log("Verified API Arrays:", {
            patients: patientsArr.length,
            doctors: doctorsArr.length,
            nurses: nursesArr.length,
            appointments: appointmentsArr.length,
            laboratory: labArr.length,
            pharmacy: pharmacyArr.length,
            billing: billingArr.length,
            records: recordsArr.length
        });

        const updateElement = (id, value) => {
            const el = document.getElementById(id);
            if (el) {
                el.innerText = value;
                el.textContent = value;
            }
        };

        updateElement("totalPatients", patientsArr.length);
        updateElement("totalDoctors", doctorsArr.length);
        updateElement("totalNurses", nursesArr.length);
        updateElement("totalAppointments", appointmentsArr.length);
        updateElement("totalLab", labArr.length);
        updateElement("totalMedicine", pharmacyArr.length);
        updateElement("totalRecords", recordsArr.length);

        let totalRevenue = 0;
        billingArr.forEach(bill => {
            totalRevenue += Number(bill.amount || 0);
        });

        updateElement("revenue", "KES " + totalRevenue.toLocaleString());

    } catch (error) {
        console.error("Dashboard Load Error:", error);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadReportsData);
} else {
    loadReportsData();
}
>>>>>>> 56f5f8a81e106236bdd2771da275a518ba4d6061
