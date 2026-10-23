
"use strict";

// ========================================
// SUJAN SOFTWARE SOLUTIONS - DEMO WEBSITE
// ========================================

// Demo administrator credentials.
// For local practice only: not secure for a real website.
const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASSWORD = "Admin@123";

const USERS_KEY = "sujan_demo_users";
const ENQUIRIES_KEY = "sujan_demo_enquiries";
const SESSION_KEY = "sujan_demo_session";


// Safely read JSON data from browser storage.
function readStorage(key) {
    try {
        const value = localStorage.getItem(key);
        const parsed = value ? JSON.parse(value) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}


// Safely save JSON data to browser storage.
function saveStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch {
        return false;
    }
}


// Show a message inside a form.
function showStatus(id, message, type = "error") {
    const element = document.getElementById(id);

    if (!element) return;

    element.textContent = message;
    element.className = "status " + type;
}


// Mobile navigation menu.
function toggleMenu() {
    const nav = document.getElementById("nav");

    if (nav) {
        nav.classList.toggle("open");
    }
}


// ========================================
// SIGN UP
// ========================================

const signupForm = document.getElementById("signupForm");

if (signupForm) {
    signupForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.getElementById("signupName").value.trim();
        const email = document.getElementById("signupEmail").value.trim().toLowerCase();
        const password = document.getElementById("signupPassword").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (!name || !email || !password) {
            showStatus("signupStatus", "Please fill in all fields.");
            return;
        }

        if (password.length < 8) {
            showStatus("signupStatus", "Password must have at least 8 characters.");
            return;
        }

        if (password !== confirmPassword) {
            showStatus("signupStatus", "Passwords do not match.");
            return;
        }

        if (email === ADMIN_EMAIL) {
            showStatus("signupStatus", "This email is reserved for the demo administrator.");
            return;
        }

        const users = readStorage(USERS_KEY);

        if (users.some(user => user.email === email)) {
            showStatus("signupStatus", "This email is already registered.");
            return;
        }

        // Demo only. Passwords are NOT securely stored.
        // Never use this method for real accounts.
        users.push({
            name: name,
            email: email,
            password: password
        });

        if (!saveStorage(USERS_KEY, users)) {
            showStatus("signupStatus", "Could not save account. Check browser storage.");
            return;
        }

        signupForm.reset();

        showStatus(
            "signupStatus",
            "Account created! Redirecting to Login...",
            "success"
        );

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1200);
    });
}


// ========================================
// LOGIN
// ========================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = document.getElementById("loginEmail").value.trim().toLowerCase();
        const password = document.getElementById("loginPassword").value;

        // Demo administrator login.
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            try {
                sessionStorage.setItem(
                    SESSION_KEY,
                    JSON.stringify({
                        email: ADMIN_EMAIL,
                        role: "admin"
                    })
                );

                window.location.href = "dashboard.html";
            } catch {
                showStatus("loginStatus", "Browser session storage is unavailable.");
            }

            return;
        }

        // Demo user login.
        const users = readStorage(USERS_KEY);

        const user = users.find(
            item => item.email === email && item.password === password
        );

        if (!user) {
            showStatus("loginStatus", "Invalid email or password.");
            return;
        }

        try {
            sessionStorage.setItem(
                SESSION_KEY,
                JSON.stringify({
                    email: user.email,
                    role: "user",
                    name: user.name
                })
            );

            showStatus("loginStatus", "Login successful!", "success");

            setTimeout(() => {
                window.location.href = "index.html";
            }, 700);
        } catch {
            showStatus("loginStatus", "Browser session storage is unavailable.");
        }
    });
}


// ========================================
// CONTACT ENQUIRY
// ========================================

const courseInput = document.getElementById("contactCourse");

if (courseInput) {
    const selectedCourse = new URLSearchParams(
        window.location.search
    ).get("course");

    if (selectedCourse) {
        courseInput.value = selectedCourse;
    }
}

const contactForm = document.getElementById("contactForm");

if (contactForm) {
    contactForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const id = Date.now().toString();
        const name = document.getElementById("contactName").value.trim();
        const email = document.getElementById("contactEmail").value.trim();
        const subject = document.getElementById("contactSubject").value.trim();
        const message = document.getElementById("contactMessage").value.trim();

        const enquiry = {
            id: id,
            name: name,
            email: email,
            phone: document.getElementById("contactPhone").value.trim(),
            course: document.getElementById("contactCourse").value,
            mode: document.getElementById("contactMode").value,
            subject: subject,
            message: message,
            date: new Date().toLocaleString()
        };

        const enquiries = readStorage(ENQUIRIES_KEY);
        enquiries.unshift(enquiry);

        if (!saveStorage(ENQUIRIES_KEY, enquiries)) {
            showStatus(
                "contactStatus",
                "Could not save enquiry. Check browser storage."
            );
            return;
        }

        contactForm.reset();

        showStatus(
            "contactStatus",
            "Enquiry saved successfully!",
            "success"
        );
    });
}


// ========================================
// ADMIN DASHBOARD
// ========================================

function getSession() {
    try {
        return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
    } catch {
        return null;
    }
}


function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    window.location.href = "login.html";
}


function addTextCell(row, value) {
    const cell = document.createElement("td");
    cell.textContent = value;
    row.appendChild(cell);
    return cell;
}


function createDeleteButton(label, callback) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "delete-btn";
    button.textContent = label;
    button.addEventListener("click", callback);
    return button;
}


function renderUsers() {
    const users = readStorage(USERS_KEY);
    const table = document.getElementById("usersTable");
    const empty = document.getElementById("usersEmpty");

    if (!table || !empty) return;

    table.replaceChildren();

    document.getElementById("totalUsers").textContent = users.length;
    empty.hidden = users.length > 0;

    users.forEach(user => {
        const row = document.createElement("tr");

        addTextCell(row, user.name);
        addTextCell(row, user.email);

        const actionCell = document.createElement("td");

        actionCell.appendChild(
            createDeleteButton("Delete", function () {
                if (!confirm("Delete this demo user?")) return;

                const updated = readStorage(USERS_KEY).filter(
                    item => item.email !== user.email
                );

                if (saveStorage(USERS_KEY, updated)) {
                    renderUsers();
                } else {
                    alert("Could not update browser storage.");
                }
            })
        );

        row.appendChild(actionCell);
        table.appendChild(row);
    });
}



function renderEnquiries() {
    const enquiries = readStorage(ENQUIRIES_KEY);
    const list = document.getElementById("enquiriesList");
    const empty = document.getElementById("enquiriesEmpty");
    const total = document.getElementById("totalEnquiries");

    if (!list || !empty) return;

    list.replaceChildren();

    if (total) {
        total.textContent = enquiries.length;
    }

    empty.hidden = enquiries.length > 0;

    enquiries.forEach(function (enquiry) {
        const card = document.createElement("article");
        card.className = "enquiry-card";

        const heading = document.createElement("h3");
        heading.textContent = enquiry.subject || "New Enquiry";
        card.appendChild(heading);

        const details = document.createElement("p");
        details.textContent =
            (enquiry.name || "No name") + " · " +
            (enquiry.email || "No email") + " · " +
            (enquiry.date || "No date");
        card.appendChild(details);

        const phone = document.createElement("p");
        phone.textContent = "Phone: " + (enquiry.phone || "Not provided");
        card.appendChild(phone);

        const course = document.createElement("p");
        course.textContent = "Course: " + (enquiry.course || "Not selected");
        card.appendChild(course);

        const mode = document.createElement("p");
        mode.textContent =
            "Learning Mode: " + (enquiry.mode || "Not selected");
        card.appendChild(mode);

        const message = document.createElement("p");
        message.textContent = "Message: " + (enquiry.message || "No message");
        card.appendChild(message);

        card.appendChild(
            createDeleteButton("Delete Enquiry", function () {
                if (!confirm("Delete this demo enquiry?")) return;

                const updated = readStorage(ENQUIRIES_KEY).filter(
                    function (item) {
                        return item.id !== enquiry.id;
                    }
                );

                if (saveStorage(ENQUIRIES_KEY, updated)) {
                    renderEnquiries();
                } else {
                    alert("Could not update browser storage.");
                }
            })
        );

        list.appendChild(card);
    });
}


function initDashboard() {
    if (!document.getElementById("usersTable")) return;

    const session = getSession();

    // Frontend-only check for demonstration.
    if (!session || session.role !== "admin" ||
        session.email !== ADMIN_EMAIL) {
        window.location.replace("login.html");
        return;
    }

    const welcome = document.getElementById("adminWelcome");

    if (welcome) {
        welcome.textContent = "Administrator";
    }

    renderUsers();
    renderEnquiries();
}


// Run the dashboard check only on dashboard.html.
initDashboard();

const courseSearch = document.getElementById("courseSearch");
const courseCategory = document.getElementById("courseCategory");
const courseCount = document.getElementById("courseCount");

if (courseSearch && courseCategory) {
    const courseCards = document.querySelectorAll(
        ".cards .service-card"
    );

    function filterCourses() {
        const searchText = courseSearch.value.toLowerCase().trim();
        const category = courseCategory.value;
        let visibleCount = 0;

        courseCards.forEach((card) => {
            const text = card.textContent.toLowerCase();

            const matchesSearch = text.includes(searchText);
            const matchesCategory =
                category === "all" ||
                card.dataset.category === category;

            const show = matchesSearch && matchesCategory;

            card.style.display = show ? "" : "none";

            if (show) visibleCount++;
        });

        if (courseCount) {
            courseCount.textContent =
                `Showing ${visibleCount} course(s)`;
        }
    }

    courseSearch.addEventListener("input", filterCourses);
    courseCategory.addEventListener("change", filterCourses);

    filterCourses();
}

