/* =====================================================
   PAGE NAVIGATION
===================================================== */

const navItems = document.querySelectorAll("[data-page]");
const pages = document.querySelectorAll(".page");


function showPage(pageName) {

    pages.forEach(page => {

        page.classList.remove("active-page");

    });


    const selectedPage =
        document.getElementById(pageName);


    if (selectedPage) {

        selectedPage.classList.add("active-page");

    }


    document
        .querySelectorAll(".nav-item")
        .forEach(item => {

            item.classList.remove("active");

            if (item.dataset.page === pageName) {

                item.classList.add("active");

            }

        });


    document
        .getElementById("sidebar")
        .classList.remove("open");


    window.scrollTo({

        top: 0,

        behavior: "smooth"

    });

}


/* Navigation buttons */

navItems.forEach(item => {

    item.addEventListener("click", () => {

        const page = item.dataset.page;

        if (page) {

            showPage(page);

        }

    });

});


/* =====================================================
   MOBILE MENU
===================================================== */

const menuBtn =
    document.getElementById("menuBtn");

const sidebar =
    document.getElementById("sidebar");


menuBtn.addEventListener("click", () => {

    sidebar.classList.toggle("open");

});


/* =====================================================
   TOAST
===================================================== */

function showToast(message) {

    const toast =
        document.getElementById("toast");

    const toastMessage =
        document.getElementById("toastMessage");


    toastMessage.textContent = message;

    toast.classList.add("show");


    setTimeout(() => {

        toast.classList.remove("show");

    }, 3000);

}


/* =====================================================
   NOTIFICATIONS
===================================================== */

document
    .getElementById("notificationBtn")
    .addEventListener("click", () => {

        showToast(
            "You have 1 new notification."
        );

    });


/* =====================================================
   SEARCH
===================================================== */

document
    .getElementById("searchInput")
    .addEventListener("keyup", function(event) {

        if (event.key === "Enter") {

            const value =
                this.value.trim();

            if (value !== "") {

                showPage("doctors");

                showToast(
                    `Searching for "${value}"...`
                );

            }

        }

    });


/* =====================================================
   APPOINTMENTS
===================================================== */

function bookAppointment() {

    showPage("appointments");

    showToast(
        "Appointment booking opened."
    );

}


function viewAppointment() {

    showToast(
        "Appointment details opened."
    );

}


function cancelAppointment() {

    const confirmed =
        confirm(
            "Are you sure you want to cancel this appointment?"
        );


    if (confirmed) {

        showToast(
            "Appointment cancelled successfully."
        );

    }

}


/* =====================================================
   EMERGENCY
===================================================== */

function callEmergency() {

    const confirmed =
        confirm(
            "Do you want to call emergency services?"
        );


    if (confirmed) {

        window.location.href =
            "tel:112";

    }

}


/* =====================================================
   LOGOUT
===================================================== */

document
    .getElementById("logoutBtn")
    .addEventListener("click", () => {

        const confirmed =
            confirm(
                "Are you sure you want to logout?"
            );


        if (confirmed) {

            showToast(
                "You have been logged out."
            );

        }

    });


/* =====================================================
   DOCTOR SEARCH
===================================================== */

const doctorSearch =
    document.getElementById("doctorSearch");


if (doctorSearch) {

    doctorSearch.addEventListener(
        "input",
        function() {

            const search =
                this.value.toLowerCase();

            document
                .querySelectorAll(
                    "#doctorList .doctor-card"
                )
                .forEach(card => {

                    const name =
                        card.dataset.name
                        .toLowerCase();

                    card.style.display =
                        name.includes(search)
                            ? "flex"
                            : "none";

                });

        }
    );

}


/* =====================================================
   SCHEME DATA
===================================================== */


/*
    IMPORTANT:

    These are demonstration records for
    your frontend prototype.

    In the real project these should come
    from your backend/database/API.
*/


const schemeData = {

    "RGHS": {

        name:
            "RGHS",

        description:
            "Rajasthan Government Health Scheme",

        status:
            "● Active Information",

        benefits: [

            {
                icon:
                    "fa-indian-rupee-sign",

                type:
                    "green",

                title:
                    "Cashless Healthcare",

                description:
                    "Eligible beneficiaries can access covered healthcare services according to applicable scheme rules."
            },

            {
                icon:
                    "fa-hospital",

                type:
                    "blue",

                title:
                    "Empanelled Hospitals",

                description:
                    "Find government and empanelled healthcare facilities available through the scheme."
            },

            {
                icon:
                    "fa-flask",

                type:
                    "purple",

                title:
                    "Diagnostic Services",

                description:
                    "Access applicable diagnostic and testing services through authorized facilities."
            },

            {
                icon:
                    "fa-pills",

                type:
                    "yellow",

                title:
                    "Medicines",

                description:
                    "Eligible beneficiaries can access applicable medicine and pharmacy services."
            }

        ]

    },


    "ECHS": {

        name:
            "ECHS",

        description:
            "Ex-Servicemen Contributory Health Scheme",

        status:
            "● Scheme Information",

        benefits: [

            {
                icon:
                    "fa-hospital",

                type:
                    "green",

                title:
                    "Healthcare Facilities",

                description:
                    "Eligible ECHS beneficiaries can access healthcare through authorized and empanelled facilities."
            },

            {
                icon:
                    "fa-user-doctor",

                type:
                    "blue",

                title:
                    "Medical Consultation",

                description:
                    "Access eligible medical consultation and healthcare services according to ECHS rules."
            },

            {
                icon:
                    "fa-flask",

                type:
                    "purple",

                title:
                    "Medical Tests",

                description:
                    "Applicable diagnostic and investigation services are available through authorized facilities."
            },

            {
                icon:
                    "fa-pills",

                type:
                    "yellow",

                title:
                    "Medicines",

                description:
                    "Eligible beneficiaries can access applicable medicine services."
            }

        ]

    },


    "CGHS": {

        name:
            "CGHS",

        description:
            "Central Government Health Scheme",

        status:
            "● Scheme Information",

        benefits: [

            {
                icon:
                    "fa-house-medical",

                type:
                    "green",

                title:
                    "Wellness Centres",

                description:
                    "Eligible beneficiaries can use applicable CGHS wellness centre services."
            },

            {
                icon:
                    "fa-hospital",

                type:
                    "blue",

                title:
                    "Empanelled Hospitals",

                description:
                    "Find hospitals and healthcare providers associated with CGHS."
            },

            {
                icon:
                    "fa-flask",

                type:
                    "purple",

                title:
                    "Diagnostics",

                description:
                    "Eligible beneficiaries can access applicable diagnostic services."
            },

            {
                icon:
                    "fa-pills",

                type:
                    "yellow",

                title:
                    "Medicines",

                description:
                    "Applicable medicines and pharmacy services can be accessed through the scheme."
            }

        ]

    },


    "MAA-Y": {

        name:
            "MAA-Y",

        description:
            "Mukhyamantri Ayushman Arogya Yojana",

        status:
            "● Scheme Information",

        benefits: [

            {
                icon:
                    "fa-hospital",

                type:
                    "green",

                title:
                    "Cashless Treatment",

                description:
                    "Eligible beneficiaries can access covered healthcare services through the scheme."
            },

            {
                icon:
                    "fa-user-doctor",

                type:
                    "blue",

                title:
                    "Hospitalization",

                description:
                    "Applicable hospitalization and treatment packages are available through authorized facilities."
            },

            {
                icon:
                    "fa-flask",

                type:
                    "purple",

                title:
                    "Diagnostics",

                description:
                    "Applicable diagnostic services can be accessed through authorized healthcare facilities."
            },

            {
                icon:
                    "fa-truck-medical",

                type:
                    "yellow",

                title:
                    "Emergency Care",

                description:
                    "Eligible emergency healthcare services are available according to applicable scheme provisions."
            }

        ]

    },


    "Bhamashah": {

        name:
            "Bhamashah",

        description:
            "Bhamashah Swasthya Bima Yojana — historical information",

        status:
            "● Historical / Legacy",

        benefits: [

            {
                icon:
                    "fa-clock-rotate-left",

                type:
                    "blue",

                title:
                    "Historical Scheme",

                description:
                    "This entry is retained for historical and project information and should not be treated as confirmation of current eligibility."
            },

            {
                icon:
                    "fa-hospital",

                type:
                    "green",

                title:
                    "Healthcare Facilities",

                description:
                    "Historical scheme information about participating healthcare facilities can be displayed here."
            },

            {
                icon:
                    "fa-file-lines",

                type:
                    "purple",

                title:
                    "Scheme Information",

                description:
                    "Users can review historical information and understand how the scheme was structured."
            },

            {
                icon:
                    "fa-circle-info",

                type:
                    "yellow",

                title:
                    "Check Current Scheme",

                description:
                    "Users should check the current Rajasthan government healthcare scheme before relying on this information."
            }

        ]

    }

};


/* =====================================================
   HOSPITAL DATA
===================================================== */

const hospitals = [

    {
        name:
            "City Hospital",

        location:
            "Jaipur",

        specialty:
            "Multi-Speciality",

        services:
            [
                "Cardiology",
                "Orthopedic",
                "General Medicine"
            ]

    },

    {
        name:
            "Rajasthan Medical Centre",

        location:
            "Jaipur",

        specialty:
            "Cardiology",

        services:
            [
                "Cardiology",
                "Diagnostics"
            ]

    },

    {
        name:
            "Jodhpur Health Hospital",

        location:
            "Jodhpur",

        specialty:
            "Multi-Speciality",

        services:
            [
                "Cardiology",
                "Orthopedic",
                "General Medicine"
            ]

    },

    {
        name:
            "Udaipur Care Centre",

        location:
            "Udaipur",

        specialty:
            "General Medicine",

        services:
            [
                "General Medicine",
                "Diagnostics"
            ]

    }

];


/* =====================================================
   SCHEME DOCTOR DATA
===================================================== */

const schemeDoctors = [

    {
        name:
            "Dr. Amit Sharma",

        specialty:
            "Cardiology",

        hospital:
            "City Hospital",

        location:
            "Jaipur",

        rating:
            "4.8"

    },

    {
        name:
            "Dr. Priya Nair",

        specialty:
            "General Medicine",

        hospital:
            "Rajasthan Medical Centre",

        location:
            "Jaipur",

        rating:
            "4.9"

    },

    {
        name:
            "Dr. Raj Mehta",

        specialty:
            "Orthopedic",

        hospital:
            "Jodhpur Health Hospital",

        location:
            "Jodhpur",

        rating:
            "4.7"

    },

    {
        name:
            "Dr. Neha Verma",

        specialty:
            "Cardiology",

        hospital:
            "Udaipur Care Centre",

        location:
            "Udaipur",

        rating:
            "4.8"

    }

];


/* =====================================================
   SELECT SCHEME
===================================================== */

let currentScheme = "RGHS";


function selectScheme(scheme) {

    currentScheme = scheme;


    const data =
        schemeData[scheme];


    if (!data) return;


    document
        .querySelectorAll(".scheme-card-item")
        .forEach(card => {

            card.classList.remove(
                "active-scheme"
            );


            if (
                card.dataset.scheme === scheme
            ) {

                card.classList.add(
                    "active-scheme"
                );

            }

        });


    document
        .getElementById(
            "selectedSchemeName"
        )
        .textContent =
        data.name;


    document
        .getElementById(
            "selectedSchemeDescription"
        )
        .textContent =
        data.description;


    document
        .getElementById(
            "schemeActiveStatus"
        )
        .textContent =
        data.status;


    renderBenefits();

    renderHospitals();

    renderSchemeDoctors();


    document
        .getElementById("schemeDetail")
        .scrollIntoView({
            behavior: "smooth",
            block: "start"
        });


    showToast(
        `${scheme} information selected.`
    );

}


/* =====================================================
   RENDER BENEFITS
===================================================== */

function renderBenefits() {

    const grid =
        document.getElementById(
            "benefitsGrid"
        );


    const data =
        schemeData[currentScheme];


    grid.innerHTML = "";


    data.benefits.forEach(
        benefit => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "benefit-card";


            card.innerHTML = `

                <div class="benefit-icon ${benefit.type}">

                    <i class="fa-solid ${benefit.icon}"></i>

                </div>

                <h3>
                    ${benefit.title}
                </h3>

                <p>
                    ${benefit.description}
                </p>

            `;


            grid.appendChild(card);

        }
    );

}


/* =====================================================
   RENDER HOSPITALS
===================================================== */

function renderHospitals() {

    const list =
        document.getElementById(
            "hospitalList"
        );


    const search =
        document
            .getElementById(
                "hospitalSearch"
            )
            .value
            .toLowerCase();


    const location =
        document
            .getElementById(
                "hospitalLocation"
            )
            .value;


    const specialty =
        document
            .getElementById(
                "hospitalSpecialty"
            )
            .value;


    list.innerHTML = "";


    const filtered =
        hospitals.filter(
            hospital => {

                const matchesSearch =

                    hospital.name
                        .toLowerCase()
                        .includes(search);


                const matchesLocation =

                    location === "all" ||
                    hospital.location === location;


                const matchesSpecialty =

                    specialty === "all" ||
                    hospital.specialty === specialty ||
                    hospital.services.includes(
                        specialty
                    );


                return (
                    matchesSearch &&
                    matchesLocation &&
                    matchesSpecialty
                );

            }
        );


    if (filtered.length === 0) {

        list.innerHTML = `

            <div class="empty-result">

                <i class="fa-solid fa-hospital"></i>

                <h3>
                    No hospitals found
                </h3>

                <p>
                    Try changing your search or filters.
                </p>

            </div>

        `;

        return;

    }


    filtered.forEach(
        hospital => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "hospital-card";


            card.innerHTML = `

                <div class="hospital-icon">

                    <i class="fa-solid fa-hospital"></i>

                </div>


                <div class="hospital-info">

                    <h3>
                        ${hospital.name}
                    </h3>

                    <p>
                        <i class="fa-solid fa-location-dot"></i>
                        ${hospital.location}
                    </p>

                    <span class="empanelled">

                        <i class="fa-solid fa-circle-check"></i>

                        ${currentScheme} Empanelled

                    </span>


                    <div class="hospital-specialties">

                        ${hospital.services
                            .map(
                                service =>
                                    `<span>${service}</span>`
                            )
                            .join("")
                        }

                    </div>


                    <div class="hospital-card-actions">

                        <button
                            onclick="viewHospital('${hospital.name}')"
                        >
                            View Hospital
                        </button>

                        <button
                            onclick="bookHospital('${hospital.name}')"
                        >
                            Book Appointment
                        </button>

                    </div>

                </div>

            `;


            list.appendChild(card);

        }
    );

}


/* =====================================================
   RENDER SCHEME DOCTORS
===================================================== */

function renderSchemeDoctors() {

    const list =
        document.getElementById(
            "schemeDoctorList"
        );


    const search =
        document
            .getElementById(
                "schemeDoctorSearch"
            )
            .value
            .toLowerCase();


    const specialty =
        document
            .getElementById(
                "schemeDoctorSpecialty"
            )
            .value;


    list.innerHTML = "";


    const filtered =
        schemeDoctors.filter(
            doctor => {

                const matchesSearch =

                    doctor.name
                        .toLowerCase()
                        .includes(search) ||

                    doctor.specialty
                        .toLowerCase()
                        .includes(search);


                const matchesSpecialty =

                    specialty === "all" ||
                    doctor.specialty === specialty;


                return (
                    matchesSearch &&
                    matchesSpecialty
                );

            }
        );


    if (filtered.length === 0) {

        list.innerHTML = `

            <div class="empty-result">

                <i class="fa-solid fa-user-doctor"></i>

                <h3>
                    No doctors found
                </h3>

                <p>
                    Try another specialty or search.
                </p>

            </div>

        `;

        return;

    }


    filtered.forEach(
        doctor => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "scheme-doctor-card";


            const initials =
                doctor.name
                    .replace("Dr. ", "")
                    .split(" ")
                    .map(
                        name =>
                            name[0]
                    )
                    .join("");


            card.innerHTML = `

                <div class="doctor-avatar">

                    ${initials}

                </div>


                <div class="scheme-doctor-info">

                    <h3>
                        ${doctor.name}
                    </h3>

                    <p>
                        ${doctor.specialty}
                    </p>

                    <p>
                        <i class="fa-solid fa-hospital"></i>
                        ${doctor.hospital}
                    </p>

                    <p>
                        <i class="fa-solid fa-location-dot"></i>
                        ${doctor.location}
                    </p>

                    <div class="rating">

                        ⭐ ${doctor.rating}

                        <span>
                            ${currentScheme} provider
                        </span>

                    </div>

                </div>


                <div class="scheme-doctor-action">

                    <button
                        onclick="bookSchemeDoctor('${doctor.name}')"
                    >
                        Book
                    </button>

                </div>

            `;


            list.appendChild(card);

        }
    );

}


/* =====================================================
   SCHEME TABS
===================================================== */

const schemeTabs =
    document.querySelectorAll(
        ".scheme-tab"
    );


schemeTabs.forEach(tab => {

    tab.addEventListener(
        "click",
        () => {

            const target =
                tab.dataset.schemeTab;


            schemeTabs.forEach(
                item => {

                    item.classList.remove(
                        "active"
                    );

                }
            );


            document
                .querySelectorAll(
                    ".scheme-tab-content"
                )
                .forEach(content => {

                    content.classList.remove(
                        "active"
                    );

                });


            tab.classList.add(
                "active"
            );


            document
                .getElementById(target)
                .classList.add(
                    "active"
                );

        }
    );

});


/* =====================================================
   HOSPITAL FILTER EVENTS
===================================================== */

document
    .getElementById(
        "hospitalSearch"
    )
    .addEventListener(
        "input",
        renderHospitals
    );


document
    .getElementById(
        "hospitalLocation"
    )
    .addEventListener(
        "change",
        renderHospitals
    );


document
    .getElementById(
        "hospitalSpecialty"
    )
    .addEventListener(
        "change",
        renderHospitals
    );


/* =====================================================
   DOCTOR FILTER EVENTS
===================================================== */

document
    .getElementById(
        "schemeDoctorSearch"
    )
    .addEventListener(
        "input",
        renderSchemeDoctors
    );


document
    .getElementById(
        "schemeDoctorSpecialty"
    )
    .addEventListener(
        "change",
        renderSchemeDoctors
    );


/* =====================================================
   VIEW HOSPITAL
===================================================== */

function viewHospital(name) {

    showToast(
        `Opening ${name} profile...`
    );

}


/* =====================================================
   BOOK HOSPITAL
===================================================== */

function bookHospital(name) {

    showPage("appointments");

    showToast(
        `Booking appointment at ${name}.`
    );

}


/* =====================================================
   BOOK SCHEME DOCTOR
===================================================== */

function bookSchemeDoctor(name) {

    showPage("appointments");

    showToast(
        `Booking appointment with ${name}.`
    );

}


/* =====================================================
   MY SCHEME -> SCHEME PAGE
===================================================== */

function openSchemeFromMyScheme(tab) {

    showPage("schemes");


    setTimeout(() => {

        const target =
            document.querySelector(
                `[data-scheme-tab="${tab}"]`
            );


        if (target) {

            target.click();

        }

    }, 100);

}


/* =====================================================
   APPOINTMENT TABS
===================================================== */

document
    .querySelectorAll(".tab")
    .forEach(tab => {

        tab.addEventListener(
            "click",
            () => {

                document
                    .querySelectorAll(".tab")
                    .forEach(
                        item =>
                            item.classList.remove(
                                "active"
                            )
                    );


                tab.classList.add(
                    "active"
                );


                showToast(
                    `${tab.textContent} appointments`
                );

            }
        );

    });


/* =====================================================
   INITIALIZE SCHEME PAGE
===================================================== */

renderBenefits();

renderHospitals();

renderSchemeDoctors();


/* =====================================================
   INITIAL PAGE
===================================================== */

showPage("home");