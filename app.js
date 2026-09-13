/* ============================================================
   GEETA'S CLINIC - DIGITAL TOKEN SYSTEM
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {

    /* ============================================================
       PAGE ELEMENTS
       ============================================================ */

    const welcomePage = document.getElementById("welcomePage");
    const loginPage = document.getElementById("loginPage");
    const tokenPage = document.getElementById("tokenPage");

    const getStartedBtn = document.getElementById("getStartedBtn");
    const loginForm = document.getElementById("loginForm");

    /* ============================================================
       DATA
       ============================================================ */

    const doctors = [
        {
            id: "doctor1",
            name: "Dr. Sarah Jenkins",
            initials: "SJ",
            accent: "cyan",
            department: "General Medicine",
            room: "Consulting Room 1",
            roomShort: "Room 1",
            prefix: "A",
            currentToken: "A-102",
            currentPatient: "Emma Watson",
            consultMinutes: 16,
            nextTokens: ["A-103", "A-104", "A-105"]
        },
        {
            id: "doctor2",
            name: "Dr. Alan Miller",
            initials: "AM",
            accent: "purple",
            department: "Pediatrics & Child Care",
            room: "Consulting Room 2",
            roomShort: "Room 2",
            prefix: "B",
            currentToken: "B-101",
            currentPatient: "Liam Johnson",
            consultMinutes: 9,
            nextTokens: ["B-102"]
        },
        {
            id: "doctor3",
            name: "Dr. Priya Patel",
            initials: "PP",
            accent: "amber",
            department: "Dermatology & Skin Care",
            room: "Consulting Room 3",
            roomShort: "Room 3",
            prefix: "C",
            currentToken: "C-101",
            currentPatient: "Aria Stark",
            consultMinutes: 4,
            nextTokens: []
        }
    ];

    let selectedDoctor = doctors[0];

    let tokenNumber = localStorage.getItem("clinicToken");

    let patientName =
        localStorage.getItem("patientName") || "tanu";

    let appointmentDate =
        localStorage.getItem("appointmentDate") || "14 Dec 2026";

    let appointmentTime =
        localStorage.getItem("appointmentTime") || "09:00 AM";


    /* ============================================================
       SMALL HELPERS
       ============================================================ */

    function getInitials(name) {

        if (!name) return "?";

        return name
            .replace(/^Dr\.\s*/i, "")
            .split(" ")
            .filter(Boolean)
            .slice(0, 2)
            .map(part => part[0].toUpperCase())
            .join("");

    }


    /* ============================================================
       PAGE NAVIGATION
       ============================================================ */

    function showPage(page) {

        const normalizedPage = String(page || "")
            .replace("Page", "")
            .toLowerCase();

        if (welcomePage) welcomePage.classList.remove("active");
        if (loginPage) loginPage.classList.remove("active");
        if (tokenPage) tokenPage.classList.remove("active");

        if (normalizedPage === "welcome" && welcomePage) {
            welcomePage.classList.add("active");
        }

        if (normalizedPage === "login" && loginPage) {
            loginPage.classList.add("active");
        }

        if (normalizedPage === "token" && tokenPage) {
            tokenPage.classList.add("active");
            showDashboard("patient");
            renderPatientView();
            renderWaitingHall();
            renderStaffDashboard();
        }

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    function showDashboard(view) {

        const normalizedView = String(view || "patient").toLowerCase();

        const patientView =
            document.getElementById("patientView") ||
            document.getElementById("patientDashboard");

        const waitingHall =
            document.getElementById("waitingHall") ||
            document.getElementById("waitingDashboard");

        const staffDashboard =
            document.getElementById("staffDashboard");

        if (patientView) {
            patientView.classList.toggle("active", normalizedView === "patient");
            patientView.classList.toggle("active-dashboard", normalizedView === "patient");
        }

        if (waitingHall) {
            waitingHall.classList.toggle("active", normalizedView === "waiting");
            waitingHall.classList.toggle("active-dashboard", normalizedView === "waiting");
        }

        if (staffDashboard) {
            staffDashboard.classList.toggle("active", normalizedView === "staff");
            staffDashboard.classList.toggle("active-dashboard", normalizedView === "staff");
        }

        document.querySelectorAll(".tab-btn").forEach(function (button) {
            const isActive =
                (button.id === "patientViewBtn" && normalizedView === "patient") ||
                (button.id === "waitingHallBtn" && normalizedView === "waiting") ||
                (button.id === "staffDashboardBtn" && normalizedView === "staff");

            button.classList.toggle("active", isActive);
        });
    }

    function showPatientView() {
        showDashboard("patient");
    }

    function showWaitingHall() {
        showDashboard("waiting");
    }

    function showStaffDashboard() {
        showDashboard("staff");
    }

    window.showPage = showPage;
    window.showDashboard = showDashboard;
    window.showPatientView = showPatientView;
    window.showWaitingHall = showWaitingHall;
    window.showStaffDashboard = showStaffDashboard;


    /* ============================================================
       GET STARTED BUTTON
       ============================================================ */

    if (getStartedBtn) {

        getStartedBtn.addEventListener("click", function () {

            showPage("login");

        });

    }


    /* ============================================================
       LOGIN
       ============================================================ */

    if (loginForm) {

        loginForm.addEventListener("submit", function (event) {

            event.preventDefault();

            const nameInput =
                document.getElementById("loginPatientName");

            const mobileInput =
                document.getElementById("loginMobile");

            const passwordInput =
                document.getElementById("loginPassword");

            if (nameInput && nameInput.value.trim() !== "") {

                patientName = nameInput.value.trim();

            }

            localStorage.setItem("patientName", patientName);

            if (mobileInput) {
                localStorage.setItem(
                    "patientMobile",
                    mobileInput.value
                );
            }

            if (passwordInput) {
                localStorage.setItem(
                    "patientPassword",
                    passwordInput.value
                );
            }

            showPage("token");

        });

    }


    /* ============================================================
       TOKEN GENERATION
       ============================================================ */

    function generateToken() {

        let currentNumber = 105;

        const oldToken = localStorage.getItem("clinicToken");

        if (oldToken) {

            const numberPart =
                parseInt(oldToken.split("-")[1]);

            if (!isNaN(numberPart)) {
                currentNumber = numberPart + 1;
            }

        }

        tokenNumber =
            selectedDoctor.prefix + "-" + currentNumber;

        localStorage.setItem(
            "clinicToken",
            tokenNumber
        );

        localStorage.setItem(
            "patientName",
            patientName
        );

        appointmentDate =
            getFormattedDate();

        appointmentTime =
            getAppointmentTime();

        localStorage.setItem(
            "appointmentDate",
            appointmentDate
        );

        localStorage.setItem(
            "appointmentTime",
            appointmentTime
        );

        /*
         * Add new token to doctor's queue.
         */

        selectedDoctor.nextTokens.push(tokenNumber);

        renderPatientView();
        renderWaitingHall();
        renderStaffDashboard();

        showPatientView();

    }


    /* ============================================================
       CURRENT DATE
       ============================================================ */

    function getFormattedDate() {

        const savedDate =
            document.getElementById("appointmentDate");

        if (
            savedDate &&
            savedDate.value
        ) {

            const date =
                new Date(savedDate.value);

            if (!isNaN(date.getTime())) {

                return date.toLocaleDateString(
                    "en-IN",
                    {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                    }
                );

            }

        }

        return new Date().toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    }


    /* ============================================================
       APPOINTMENT TIME
       ============================================================ */

    function getAppointmentTime() {

        const timeInput =
            document.getElementById("appointmentTime");

        if (
            timeInput &&
            timeInput.value
        ) {

            return timeInput.value;

        }

        return "09:00 AM";

    }


    /* ============================================================
       PATIENT VIEW
       ============================================================ */

    function renderPatientView() {

        const patientView =
            document.getElementById("patientView") ||
            document.getElementById("patientDashboard");

        if (!patientView) return;

        if (!tokenNumber) {

            patientView.innerHTML = `

                <div class="glass-card main-card">

                    <span class="pill-tag">
                        SELF-SERVICE KIOSK
                    </span>

                    <div class="card-header">

                        <h2>
                            Take Your Digital Token
                        </h2>

                        <p class="card-desc">
                            Select your doctor and appointment
                            details to generate your digital token.
                        </p>

                    </div>

                    <div class="kiosk-form">

                        <div class="form-group">

                            <label>
                                Patient Name
                            </label>

                            <input
                                id="tokenPatientName"
                                type="text"
                                placeholder="Enter patient name"
                                value="${patientName}"
                            >

                        </div>


                        <div class="form-group">

                            <label>
                                Choose Doctor
                            </label>

                            <div
                                class="doctor-cards-grid"
                                id="doctorSelection"
                            >

                                ${createDoctorCards()}

                            </div>

                        </div>


                        <div class="form-group">

                            <label>
                                Select Date
                            </label>

                            <input
                                type="date"
                                id="appointmentDate"
                            >

                        </div>


                        <div class="form-group">

                            <label>
                                Select Time
                            </label>

                            <select
                                id="appointmentTime"
                            >

                                <option>
                                    09:00 AM
                                </option>

                                <option>
                                    10:00 AM
                                </option>

                                <option>
                                    11:00 AM
                                </option>

                                <option>
                                    12:00 PM
                                </option>

                                <option>
                                    02:00 PM
                                </option>

                                <option>
                                    03:00 PM
                                </option>

                                <option>
                                    04:00 PM
                                </option>

                                <option>
                                    05:00 PM
                                </option>

                            </select>

                        </div>


                        <button
                            class="glow-button"
                            id="getTokenButton"
                        >

                            🎟️ Get Your Token

                        </button>

                    </div>

                </div>

            `;

            attachTokenEvents();

            return;
        }


        /* ========================================================
           OLD / PREMIUM TOKEN DISPLAY
           ======================================================== */

        const peopleAhead =
            selectedDoctor.nextTokens.length > 0
                ? selectedDoctor.nextTokens.indexOf(tokenNumber)
                : 0;

        const estimatedMinutes =
            Math.max(0, peopleAhead * 10);

        const progress =
            peopleAhead === 0
                ? 100
                : Math.max(
                    20,
                    100 - (peopleAhead * 20)
                );


        patientView.innerHTML = `

            <div class="glass-card token-view-card">

                <!-- TOP ALERT -->

                <div class="turn-alert-banner">

                    <div class="alert-icon-wrap">
                        🔔
                    </div>

                    <div class="alert-text">

                        <strong>
                            Your token is active
                        </strong>

                        <p>
                            Please keep this page open
                            to monitor your queue.
                        </p>

                    </div>

                </div>


                <!-- DIGITAL TICKET -->

                <div class="glass-ticket">

                    <!-- TICKET HEADER -->

                    <div class="ticket-header">

                        <div>

                            <div class="clinic-sub-label">
                                QSMART CARECLINIC
                            </div>

                            <h3>
                                ${selectedDoctor.name}
                            </h3>

                            <div class="ticket-dept">

                                ${selectedDoctor.department}
                                •
                                ${selectedDoctor.room}

                            </div>

                        </div>


                        <div style="text-align:right">

                            <div id="liveClock">
                                ${getCurrentTime()}
                            </div>

                            <span class="pill-tag">
                                ● ACTIVE
                            </span>

                        </div>

                    </div>


                    <!-- TOKEN NUMBER -->

                    <div
                        style="
                        text-align:center;
                        padding:40px 20px 30px;
                        "
                    >

                        <div
                            style="
                            color:#94a3b8;
                            font-size:15px;
                            font-weight:700;
                            letter-spacing:2px;
                            "
                        >
                            YOUR TOKEN NUMBER
                        </div>


                        <div
                            style="
                            font-size:78px;
                            font-weight:800;
                            color:#00f2fe;
                            text-shadow:
                            0 0 25px
                            rgba(0,242,254,0.45);
                            margin:5px 0;
                            "
                        >

                            ${tokenNumber}

                        </div>


                        <div
                            style="
                            font-size:18px;
                            color:#cbd5e1;
                            "
                        >

                            Patient:
                            <strong>
                                ${patientName}
                            </strong>

                        </div>

                    </div>


                    <!-- QUEUE INFORMATION -->

                    <div
                        style="
                        display:grid;
                        grid-template-columns:
                        repeat(3,1fr);
                        gap:16px;
                        padding:0 28px 28px;
                        "
                    >

                        <div class="queue-info-card">

                            <span>
                                ▶
                            </span>

                            <small>
                                CURRENTLY SERVING
                            </small>

                            <strong>
                                ${selectedDoctor.currentToken}
                            </strong>

                        </div>


                        <div class="queue-info-card">

                            <span>
                                👥
                            </span>

                            <small>
                                PEOPLE AHEAD
                            </small>

                            <strong>
                                ${peopleAhead}
                            </strong>

                        </div>


                        <div class="queue-info-card">

                            <span>
                                ◷
                            </span>

                            <small>
                                ESTIMATED WAIT TIME
                            </small>

                            <strong>
                                ~ ${estimatedMinutes} mins
                            </strong>

                        </div>

                    </div>


                    <!-- PROGRESS -->

                    <div
                        style="
                        padding:0 28px 30px;
                        "
                    >

                        <div
                            style="
                            display:flex;
                            justify-content:
                            space-between;
                            margin-bottom:10px;
                            color:#94a3b8;
                            "
                        >

                            <span>
                                Queue Progress
                            </span>

                            <span>
                                ${peopleAhead} ahead
                            </span>

                        </div>


                        <div
                            style="
                            height:10px;
                            background:#1e293b;
                            border-radius:20px;
                            overflow:hidden;
                            "
                        >

                            <div
                                style="
                                width:${progress}%;
                                height:100%;
                                background:
                                linear-gradient(
                                90deg,
                                #00f2fe,
                                #10b981
                                );
                                border-radius:20px;
                                "
                            ></div>

                        </div>


                        <div
                            style="
                            text-align:center;
                            margin-top:20px;
                            "
                        >

                            <span class="pill-tag">

                                Waiting in Queue
                                (${peopleAhead} ahead)

                            </span>

                        </div>

                    </div>


                    <!-- FOOTER -->

                    <div
                        style="
                        border-top:
                        1px dashed
                        rgba(255,255,255,0.15);

                        padding:
                        20px 28px;

                        display:flex;
                        justify-content:
                        space-between;

                        align-items:center;

                        gap:15px;

                        flex-wrap:wrap;
                        "
                    >

                        <div>

                            💡 Feel free to wait in the
                            cafeteria or parking area.

                            <br>

                            <span
                                style="
                                color:#94a3b8;
                                font-size:13px;
                                "
                            >
                                This page refreshes
                                automatically.
                            </span>

                        </div>


                        <div
                            style="
                            display:flex;
                            gap:10px;
                            "
                        >

                            <button
                                class="secondary-button"
                                id="cancelTokenBtn"
                            >
                                Cancel Token
                            </button>


                            <button
                                class="glow-button"
                                id="newTokenBtn"
                            >
                                New Token
                            </button>

                        </div>

                    </div>

                </div>

            </div>

        `;


        attachTokenDisplayEvents();

        startLiveClock();

    }


    /* ============================================================
       DOCTOR CARDS
       ============================================================ */

    function createDoctorCards() {

        return doctors.map(function (doctor) {

            return `

                <div
                    class="doctor-select-card
                    ${doctor.id === selectedDoctor.id
                    ? "selected"
                    : ""}"

                    data-doctor="${doctor.id}"
                >

                    <div class="doc-top">

                        <span style="font-size:28px">
                            👨‍⚕️
                        </span>

                        <span class="doc-room-badge">
                            ${doctor.room}
                        </span>

                    </div>

                    <div class="doc-name">
                        ${doctor.name}
                    </div>

                    <div class="doc-dept">
                        ${doctor.department}
                    </div>

                    <div class="doc-queue-brief">

                        <span>
                            Current
                        </span>

                        <strong>
                            ${doctor.currentToken}
                        </strong>

                    </div>

                </div>

            `;

        }).join("");

    }


    /* ============================================================
       TOKEN FORM EVENTS
       ============================================================ */

    function attachTokenEvents() {

        const doctorCards =
            document.querySelectorAll(
                ".doctor-select-card"
            );

        doctorCards.forEach(function (card) {

            card.addEventListener(
                "click",
                function () {

                    const doctorId =
                        card.dataset.doctor;

                    const doctor =
                        doctors.find(
                            d => d.id === doctorId
                        );

                    if (doctor) {

                        selectedDoctor = doctor;

                        doctorCards.forEach(
                            c =>
                            c.classList.remove(
                                "selected"
                            )
                        );

                        card.classList.add(
                            "selected"
                        );

                    }

                }
            );

        });


        const getTokenButton =
            document.getElementById(
                "getTokenButton"
            );


        if (getTokenButton) {

            getTokenButton.addEventListener(
                "click",
                function () {

                    const nameInput =
                        document.getElementById(
                            "tokenPatientName"
                        );

                    if (
                        nameInput &&
                        nameInput.value.trim()
                    ) {

                        patientName =
                            nameInput.value.trim();

                    }

                    if (!patientName) {

                        alert(
                            "Please enter patient name."
                        );

                        return;

                    }

                    generateToken();

                }
            );

        }

    }


    /* ============================================================
       TOKEN DISPLAY BUTTONS
       ============================================================ */

    function attachTokenDisplayEvents() {

        const cancelButton =
            document.getElementById(
                "cancelTokenBtn"
            );

        const newTokenButton =
            document.getElementById(
                "newTokenBtn"
            );


        if (cancelButton) {

            cancelButton.addEventListener(
                "click",
                function () {

                    const confirmCancel =
                        confirm(
                            "Are you sure you want to cancel your token?"
                        );

                    if (!confirmCancel) return;

                    localStorage.removeItem(
                        "clinicToken"
                    );

                    tokenNumber = null;

                    renderPatientView();

                }
            );

        }


        if (newTokenButton) {

            newTokenButton.addEventListener(
                "click",
                function () {

                    localStorage.removeItem(
                        "clinicToken"
                    );

                    tokenNumber = null;

                    renderPatientView();

                }
            );

        }

    }


    /* ============================================================
       WAITING HALL DISPLAY
       ============================================================ */

    function renderWaitingHall() {

        const waitingHall =
            document.getElementById("waitingHall") ||
            document.getElementById("waitingDashboard");

        if (!waitingHall) return;


        waitingHall.innerHTML = `

            <div class="glass-card wide-card">

                <div class="waiting-header">

                    <div>

                        <span class="pill-tag red-tag">
                            LIVE CLINIC DISPLAY
                        </span>

                        <h2>
                            Waiting Room Token Board
                        </h2>

                        <p class="card-desc">
                            Real-time consultation status
                            across all clinic consulting rooms.
                        </p>

                    </div>

                    <div class="large-clock">
                        ${getCurrentTime()}
                    </div>

                </div>


                <div class="doctor-board-grid">

                    ${doctors.map(
                        doctor => `

                        <div class="doctor-board-card accent-${doctor.accent}">

                            <div class="doctor-board-header">

                                <div class="doctor-id-group">

                                    <div class="doctor-avatar">
                                        ${doctor.initials}
                                    </div>

                                    <div>

                                        <h3>
                                            ${doctor.name}
                                        </h3>

                                        <p>
                                            ${doctor.department}
                                        </p>

                                    </div>

                                </div>

                                <span
                                    class="room-badge"
                                >
                                    ${doctor.roomShort}
                                </span>

                            </div>


                            <div
                                class="currently-serving-area"
                            >

                                <div>
                                    CURRENTLY SERVING
                                </div>

                                <strong>
                                    ${doctor.currentToken}
                                </strong>

                                <p>
                                    Patient:
                                    ${doctor.currentPatient}
                                </p>

                            </div>


                            <div class="next-queue">

                                <span>
                                    Next in Queue
                                </span>

                                <div>

                                    ${
                                        doctor.nextTokens.length
                                        ?
                                        doctor.nextTokens
                                        .slice(0, 4)
                                        .map(
                                            token =>
                                            `<span>${token}</span>`
                                        )
                                        .join("")
                                        :
                                        `<span class="queue-empty">
                                            Queue empty
                                        </span>`
                                    }

                                </div>

                            </div>

                        </div>

                    `).join("")}

                </div>

            </div>

        `;

    }


    /* ============================================================
       STAFF DASHBOARD
       ============================================================ */

    function renderStaffDashboard() {

        const staffDashboard =
            document.getElementById("staffDashboard");

        if (!staffDashboard) return;


        staffDashboard.innerHTML = `

            <div
                class="staff-layout"
            >

                <!-- LEFT SIDE -->

                <div class="glass-card staff-selection">

                    <span class="pill-tag blue-tag">
                        STAFF CONSOLE
                    </span>

                    <h2>
                        Doctor & Room
                        Selection
                    </h2>


                    <div
                        class="form-group"
                        style="margin-top:25px"
                    >

                        <label>
                            Select Operating Doctor
                        </label>

                        <select
                            id="staffDoctorSelect"
                            class="glass-select"
                        >

                            ${doctors.map(
                                doctor =>
                                `
                                <option
                                    value="${doctor.id}"
                                    ${
                                    doctor.id ===
                                    selectedDoctor.id
                                    ? "selected"
                                    : ""
                                    }
                                >
                                    ${doctor.name}
                                    (${doctor.roomShort})
                                </option>
                                `
                            ).join("")}

                        </select>

                    </div>


                    <div
                        class="current-consultation accent-${selectedDoctor.accent}"
                    >

                        <span>
                            NOW CONSULTING
                            IN THIS ROOM
                        </span>

                        <strong>
                            ${selectedDoctor.currentToken}
                        </strong>

                        <p>
                            Patient:
                            ${selectedDoctor.currentPatient}
                        </p>

                        <div class="consult-timer">
                            <span class="timer-dot"></span>
                            In consultation:
                            ~${selectedDoctor.consultMinutes} min
                        </div>

                    </div>


                    <button
                        class="call-next-button"
                        id="callNextPatient"
                    >

                        ▶
                        Call Next Patient

                    </button>


                    <div class="staff-action-grid">

                        <button
                            class="recall-button"
                            id="recallButton"
                        >
                            🔔
                            <span>
                                Recall /
                                Re-Announce
                            </span>
                        </button>


                        <button
                            class="complete-button"
                            id="completeButton"
                        >
                            ✓
                            <span>
                                Complete Visit
                            </span>
                        </button>

                    </div>

                </div>


                <!-- RIGHT SIDE -->

                <div class="glass-card queue-management">

                    <div
                        class="staff-tabs"
                    >

                        <button class="staff-tab active">
                            Waiting Queue
                            (${selectedDoctor.nextTokens.length})
                        </button>

                        <button class="staff-tab">
                            Skipped / On Hold
                            (0)
                        </button>

                        <button class="staff-tab">
                            Today's History
                            (1)
                        </button>

                    </div>


                    <div class="queue-table-wrapper">

                        ${
                            selectedDoctor.nextTokens.length === 0
                            ? `
                                <div class="queue-empty-state">
                                    <div class="queue-empty-icon">◌</div>
                                    <strong>No one is waiting</strong>
                                    <p>New tokens for this room will appear here.</p>
                                </div>
                            `
                            : `
                                <table class="queue-table">

                                    <thead>
                                        <tr>
                                            <th>TOKEN #</th>
                                            <th>PATIENT NAME</th>
                                            <th>CREATED</th>
                                            <th>EST. WAIT</th>
                                            <th>ACTION</th>
                                        </tr>
                                    </thead>

                                    <tbody>

                                        ${
                                            selectedDoctor.nextTokens
                                            .map(
                                                (token, index) => {

                                                    const isCurrentPatient =
                                                        token === tokenNumber;

                                                    const name =
                                                        isCurrentPatient
                                                        ? patientName
                                                        : "Patient " + (index + 1);

                                                    const waitClass =
                                                        index === 0
                                                        ? "wait-pill wait-now"
                                                        : "wait-pill";

                                                    return `

                                                    <tr>

                                                        <td>
                                                            <span class="table-token">
                                                                ${token}
                                                            </span>
                                                        </td>

                                                        <td>
                                                            <div class="patient-cell">
                                                                <span class="patient-avatar">
                                                                    ${getInitials(name)}
                                                                </span>
                                                                ${name}
                                                            </div>
                                                        </td>

                                                        <td>
                                                            ${getCurrentTime()}
                                                        </td>

                                                        <td>
                                                            <span class="${waitClass}">
                                                                ~${index * 10}m
                                                            </span>
                                                        </td>

                                                        <td>
                                                            <button class="call-now-button" data-call-token="${token}">
                                                                Call Now
                                                            </button>
                                                        </td>

                                                    </tr>

                                                    `;

                                                }
                                            )
                                            .join("")
                                        }

                                    </tbody>

                                </table>
                            `
                        }

                    </div>

                </div>

            </div>

        `;


        const doctorSelect =
            document.getElementById(
                "staffDoctorSelect"
            );


        if (doctorSelect) {

            doctorSelect.addEventListener(
                "change",
                function () {

                    const doctor =
                        doctors.find(
                            d =>
                            d.id ===
                            doctorSelect.value
                        );

                    if (doctor) {

                        selectedDoctor = doctor;

                        renderStaffDashboard();
                        renderPatientView();

                    }

                }
            );

        }


        const callNext =
            document.getElementById(
                "callNextPatient"
            );


        if (callNext) {

            callNext.addEventListener(
                "click",
                function () {

                    if (
                        selectedDoctor.nextTokens.length === 0
                    ) {

                        alert(
                            "No patients are waiting."
                        );

                        return;

                    }

                    selectedDoctor.currentToken =
                        selectedDoctor.nextTokens.shift();

                    selectedDoctor.currentPatient =
                        selectedDoctor.currentToken ===
                        tokenNumber
                            ? patientName
                            : "Patient";

                    selectedDoctor.consultMinutes = 0;

                    renderStaffDashboard();
                    renderWaitingHall();
                    renderPatientView();

                }
            );

        }


        const completeButton =
            document.getElementById(
                "completeButton"
            );


        if (completeButton) {

            completeButton.addEventListener(
                "click",
                function () {

                    alert(
                        "Visit completed successfully."
                    );

                }
            );

        }


        const recallButton =
            document.getElementById(
                "recallButton"
            );


        if (recallButton) {

            recallButton.addEventListener(
                "click",
                function () {

                    alert(
                        "Patient has been re-announced."
                    );

                }
            );

        }


        staffDashboard
            .querySelectorAll("[data-call-token]")
            .forEach(function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        window.callSpecificPatient(
                            button.dataset.callToken
                        );

                    }
                );

            });

    }


    /* ============================================================
       NAVIGATION BETWEEN THIRD-PAGE VIEWS
       ============================================================ */

    document.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    "[data-view]"
                );

            if (!button) return;

            const view =
                button.dataset.view;

            showThirdPageView(view);

        }
    );


    function showThirdPageView(view) {

        const patientView =
            document.getElementById("patientView") ||
            document.getElementById("patientDashboard");

        const waitingHall =
            document.getElementById("waitingHall") ||
            document.getElementById("waitingDashboard");

        const staffDashboard =
            document.getElementById("staffDashboard");


        if (patientView)
            patientView.classList.remove(
                "active"
            );

        if (waitingHall)
            waitingHall.classList.remove(
                "active"
            );

        if (staffDashboard)
            staffDashboard.classList.remove(
                "active"
            );


        const selectedTab =
            document.querySelectorAll(
                "[data-view]"
            );

        selectedTab.forEach(
            tab =>
            tab.classList.remove("active")
        );


        if (view === "patient") {

            if (patientView)
                patientView.classList.add(
                    "active"
                );

        }


        if (view === "waiting") {

            if (waitingHall)
                waitingHall.classList.add(
                    "active"
                );

        }


        if (view === "staff") {

            if (staffDashboard)
                staffDashboard.classList.add(
                    "active"
                );

        }


        document
            .querySelectorAll(
                `[data-view="${view}"]`
            )
            .forEach(
                tab =>
                tab.classList.add("active")
            );

    }


    /* ============================================================
       CLOCK
       ============================================================ */

    function getCurrentTime() {

        return new Date().toLocaleTimeString(
            "en-IN",
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }
        );

    }


    function startLiveClock() {

        setInterval(
            function () {

                const clock =
                    document.getElementById(
                        "liveClock"
                    );

                if (clock) {

                    clock.textContent =
                        getCurrentTime();

                }

                const hallClock =
                    document.querySelector(
                        "#waitingDashboard .large-clock"
                    );

                if (hallClock) {

                    hallClock.textContent =
                        getCurrentTime();

                }

            },
            1000
        );

    }

    window.cancelToken = function () {
        const confirmCancel = confirm("Are you sure you want to cancel your token?");

        if (!confirmCancel) return;

        localStorage.removeItem("clinicToken");
        tokenNumber = null;
        renderPatientView();
    };

    window.startNewToken = function () {
        localStorage.removeItem("clinicToken");
        tokenNumber = null;
        renderPatientView();
    };

    window.callNextPatient = function () {
        if (selectedDoctor.nextTokens.length === 0) {
            alert("No patients are waiting.");
            return;
        }

        selectedDoctor.currentToken = selectedDoctor.nextTokens.shift();
        selectedDoctor.currentPatient = selectedDoctor.currentToken === tokenNumber
            ? patientName
            : "Patient";

        renderStaffDashboard();
        renderWaitingHall();
        renderPatientView();
    };

    window.recallPatient = function () {
        alert("Patient has been re-announced.");
    };

    window.completeVisit = function () {
        alert("Visit completed successfully.");
    };

    window.callSpecificPatient = function (token) {
        alert("Calling " + token + " now.");
    };

    window.showThirdPageView = showThirdPageView;


    /* ============================================================
       LIVE CLOCK FOR WAITING HALL (runs regardless of active page)
       ============================================================ */

    setInterval(function () {

        const hallClock =
            document.querySelector(
                "#waitingDashboard .large-clock"
            );

        if (hallClock) {

            hallClock.textContent = getCurrentTime();

        }

    }, 1000);


    /* ============================================================
       INITIAL PAGE
       ============================================================ */

    showPage("welcome");

});