const users = JSON.parse(localStorage.getItem("users")) || [];
const jobs = JSON.parse(localStorage.getItem("jobs")) || [];
const applications = JSON.parse(localStorage.getItem("applications")) || [];

const currentUser = JSON.parse(localStorage.getItem("currentUser"));

function saveData() {
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("jobs", JSON.stringify(jobs));
    localStorage.setItem("applications", JSON.stringify(applications));
}

function showMessage(elementId, message, type = "success") {
    const element = document.getElementById(elementId);

    if (element) {
        element.textContent = message;
        element.className = `message ${type}`;
    }
}

function redirectByRole(role) {
    if (role === "admin") {
        window.location.href = "admin.html";
    } else if (role === "recruiter") {
        window.location.href = "recruiter.html";
    } else {
        window.location.href = "dashboard.html";
    }
}

const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = document.getElementById("registerName").value.trim();
        const email = document.getElementById("registerEmail").value.trim().toLowerCase();
        const password = document.getElementById("registerPassword").value;
        const role = document.getElementById("registerRole").value;
        const course = document.getElementById("registerCourse").value.trim();

        const existingUser = users.find(user => user.email === email);

        if (existingUser) {
            showMessage("registerMessage", "Email already registered.", "error");
            return;
        }

        const newUser = {
            id: Date.now(),
            name,
            email,
            password,
            role,
            course,
            phone: "",
            year: "",
            cpi: "",
            skills: "",
            github: "",
            linkedin: ""
        };

        users.push(newUser);
        saveData();

        showMessage("registerMessage", "Registration successful.", "success");

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1000);
    });
}

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = document.getElementById("loginEmail").value.trim().toLowerCase();
        const password = document.getElementById("loginPassword").value.trim();
       if (email === "pachauriu556@gmail.com" && password === "7300@.com") {
    const adminUser = {
        id: 0,
        name: "Administrator",
        email,
        role: "admin"
    };

    localStorage.setItem("currentUser", JSON.stringify(adminUser));
    redirectByRole("admin");
    return;
}
        const user = users.find(
            item => item.email === email && item.password === password
        );

        if (!user) {
            showMessage("loginMessage", "Invalid email or password.", "error");
            return;
        }

        localStorage.setItem("currentUser", JSON.stringify(user));
        redirectByRole(user.role);
    });
}

const logoutBtn = document.getElementById("logoutBtn");

if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
        localStorage.removeItem("currentUser");
        window.location.href = "login.html";
    });
}

if (currentUser) {
    const welcomeMessage = document.getElementById("welcomeMessage");
    const roleMessage = document.getElementById("roleMessage");

    if (welcomeMessage) {
        welcomeMessage.textContent = `Welcome, ${currentUser.name}`;
    }

    if (roleMessage) {
        roleMessage.textContent = `You are logged in as ${currentUser.role}.`;
    }
}

function protectPage() {
    const publicPages = ["index.html", "login.html", "register.html", ""];
    const currentPage = window.location.pathname.split("/").pop();

    if (!currentUser && !publicPages.includes(currentPage)) {
        window.location.href = "login.html";
    }
}

protectPage();


let availableJobs = [];

async function loadJobs() {
    const jobsContainer = document.getElementById("jobsContainer");

    if (!jobsContainer) {
        return;
    }

    try {
        const response = await fetch("data.json");
        const data = await response.json();

        availableJobs = data.jobs || [];
        displayJobs(availableJobs);
    } catch (error) {
        jobsContainer.innerHTML = `
            <div class="empty-state">
                <h2>Unable to Load Jobs</h2>
                <p>Please run the project using Live Server.</p>
            </div>
        `;
        console.error("Jobs loading error:", error);
    }
}

function displayJobs(jobList) {
    const jobsContainer = document.getElementById("jobsContainer");

    if (!jobsContainer) {
        return;
    }

    if (jobList.length === 0) {
        jobsContainer.innerHTML = `
            <div class="empty-state">
                <h2>No Jobs Found</h2>
                <p>Try changing your search or filters.</p>
            </div>
        `;
        return;
    }

    jobsContainer.innerHTML = jobList.map(job => `
        <div class="job-card">
            <h2>${job.title}</h2>
            <p><strong>Company:</strong> ${job.company}</p>
            <p>${job.description}</p>

            <div class="job-meta">
                <span class="badge">${job.type}</span>
                <span class="badge">${job.location}</span>
                <span class="badge">${job.package}</span>
            </div>

            <p><strong>Skills:</strong> ${job.skills.join(", ")}</p>

            <a href="job-details.html?id=${job.id}" class="btn primary-btn">
                View Details
            </a>
        </div>
    `).join("");
}

function filterJobs() {
    const searchInput = document.getElementById("jobSearch");
    const typeFilter = document.getElementById("jobTypeFilter");
    const locationFilter = document.getElementById("jobLocationFilter");

    if (!searchInput || !typeFilter || !locationFilter) {
        return;
    }

    const searchText = searchInput.value.toLowerCase();
    const selectedType = typeFilter.value;
    const selectedLocation = locationFilter.value;

    const filteredJobs = availableJobs.filter(job => {
        const matchesSearch =
            job.title.toLowerCase().includes(searchText) ||
            job.company.toLowerCase().includes(searchText);

        const matchesType =
            selectedType === "" || job.type === selectedType;

        const matchesLocation =
            selectedLocation === "" || job.location === selectedLocation;

        return matchesSearch && matchesType && matchesLocation;
    });

    displayJobs(filteredJobs);
}

const jobSearch = document.getElementById("jobSearch");
const jobTypeFilter = document.getElementById("jobTypeFilter");
const jobLocationFilter = document.getElementById("jobLocationFilter");

if (jobSearch) {
    jobSearch.addEventListener("input", filterJobs);
}

if (jobTypeFilter) {
    jobTypeFilter.addEventListener("change", filterJobs);
}

if (jobLocationFilter) {
    jobLocationFilter.addEventListener("change", filterJobs);
}

loadJobs();

async function loadJobDetails() {
    const jobDetails = document.getElementById("jobDetails");

    if (!jobDetails) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const jobId = Number(params.get("id"));

    try {
        const response = await fetch("data.json");
        const data = await response.json();

        const job = data.jobs.find(item => item.id === jobId);

        if (!job) {
            jobDetails.innerHTML = `
                <h2>Job Not Found</h2>
                <p>Requested job is not available.</p>
            `;
            return;
        }

        jobDetails.innerHTML = `
            <h1>${job.title}</h1>
            <h2>${job.company}</h2>
            <p>${job.description}</p>

            <div class="job-meta">
                <span class="badge">${job.type}</span>
                <span class="badge">${job.location}</span>
                <span class="badge">${job.package}</span>
            </div>

            <p><strong>Required Skills:</strong> ${job.skills.join(", ")}</p>
        `;

        const nameInput = document.getElementById("applicantName");
        const emailInput = document.getElementById("applicantEmail");

        if (currentUser) {
            if (nameInput) {
                nameInput.value = currentUser.name || "";
            }

            if (emailInput) {
                emailInput.value = currentUser.email || "";
            }
        }
    } catch (error) {
        jobDetails.innerHTML = `
            <h2>Unable to Load Job</h2>
            <p>Run the project using Live Server.</p>
        `;
    }
}

const applicationForm = document.getElementById("applicationForm");

if (applicationForm) {
    applicationForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        if (!currentUser) {
            showMessage("applicationMessage", "Please login first.", "error");
            return;
        }

        const params = new URLSearchParams(window.location.search);
        const jobId = Number(params.get("id"));

        const response = await fetch("data.json");
        const data = await response.json();

        const job = data.jobs.find(item => item.id === jobId);

        if (!job) {
            showMessage("applicationMessage", "Job not found.", "error");
            return;
        }

        const existingApplication = applications.find(
            application =>
                application.jobId === jobId &&
                application.userEmail === currentUser.email
        );

        if (existingApplication) {
            showMessage(
                "applicationMessage",
                "You have already applied for this job.",
                "error"
            );
            return;
        }

        const application = {
            id: Date.now(),
            jobId: job.id,
            jobTitle: job.title,
            company: job.company,
            userName: document.getElementById("applicantName").value.trim(),
            userEmail: document.getElementById("applicantEmail").value.trim(),
            resume: document.getElementById("applicantResume").value.trim(),
            status: "Applied",
            appliedAt: new Date().toLocaleDateString()
        };

        applications.push(application);
        saveData();

        showMessage(
            "applicationMessage",
            "Application submitted successfully!",
            "success"
        );

        applicationForm.reset();

        setTimeout(() => {
            window.location.href = "applications.html";
        }, 1200);
    });
}

loadJobDetails();

function displayApplications(applicationList) {
    const container = document.getElementById("applicationsContainer");

    if (!container) {
        return;
    }

    if (applicationList.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <h2>No Applications Found</h2>
                <p>You have not applied for any jobs yet.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = applicationList.map(application => `
        <div class="job-card">
            <h2>${application.jobTitle}</h2>
            <p><strong>Company:</strong> ${application.company}</p>
            <p><strong>Applicant:</strong> ${application.userName}</p>
            <p><strong>Email:</strong> ${application.userEmail}</p>
            <p><strong>Applied On:</strong> ${application.appliedAt}</p>

            <div class="job-meta">
                <span class="status-badge status-${application.status.toLowerCase()}">
                    ${application.status}
                </span>
            </div>

            <a href="${application.resume}" target="_blank" class="btn primary-btn">
                View Resume
            </a>
        </div>
    `).join("");
}

function loadApplications() {
    const container = document.getElementById("applicationsContainer");

    if (!container) {
        return;
    }

    if (!currentUser) {
        window.location.href = "login.html";
        return;
    }

    const userApplications = applications.filter(
        application => application.userEmail === currentUser.email
    );

    displayApplications(userApplications);
}

const applicationStatusFilter = document.getElementById("applicationStatusFilter");

if (applicationStatusFilter) {
    applicationStatusFilter.addEventListener("change", function () {
        if (!currentUser) {
            return;
        }

        const selectedStatus = applicationStatusFilter.value;

        let userApplications = applications.filter(
            application => application.userEmail === currentUser.email
        );

        if (selectedStatus !== "") {
            userApplications = userApplications.filter(
                application => application.status === selectedStatus
            );
        }

        displayApplications(userApplications);
    });
}

loadApplications();


async function loadAdminPanel() {
    const usersContainer = document.getElementById("usersContainer");
    const jobsContainer = document.getElementById("adminJobsContainer");
    const applicationsContainer = document.getElementById("adminApplicationsContainer");

    if (!usersContainer && !jobsContainer && !applicationsContainer) {
        return;
    }

    if (!currentUser || currentUser.role !== "admin") {
        window.location.href = "login.html";
        return;
    }

    const students = users.filter(user => user.role === "student");
    const recruiters = users.filter(user => user.role === "recruiter");

    document.getElementById("adminStudentCount").textContent = students.length;
    document.getElementById("adminRecruiterCount").textContent = recruiters.length;
    document.getElementById("adminApplicationCount").textContent = applications.length;

    try {
        const response = await fetch("data.json");
        const data = await response.json();
        const adminJobs = data.jobs || [];

        document.getElementById("adminJobCount").textContent = adminJobs.length;

        if (usersContainer) {
            usersContainer.innerHTML = users.length
                ? users.map(user => `
                    <div class="job-card">
                        <h3>${user.name}</h3>
                        <p><strong>Email:</strong> ${user.email}</p>
                        <p><strong>Role:</strong> ${user.role}</p>
                    </div>
                `).join("")
                : "<p class='muted'>No users found.</p>";
        }

        if (jobsContainer) {
            jobsContainer.innerHTML = adminJobs.length
                ? adminJobs.map(job => `
                    <div class="job-card">
                        <h3>${job.title}</h3>
                        <p><strong>Company:</strong> ${job.company}</p>
                        <p><strong>Type:</strong> ${job.type}</p>
                        <p><strong>Location:</strong> ${job.location}</p>
                    </div>
                `).join("")
                : "<p class='muted'>No jobs found.</p>";
        }
    } catch (error) {
        if (jobsContainer) {
            jobsContainer.innerHTML = "<p class='error'>Unable to load jobs.</p>";
        }
    }

    if (applicationsContainer) {
        applicationsContainer.innerHTML = applications.length
            ? applications.map(application => `
                <div class="job-card">
                    <h3>${application.jobTitle}</h3>
                    <p><strong>Company:</strong> ${application.company}</p>
                    <p><strong>Student:</strong> ${application.userName}</p>
                    <p><strong>Email:</strong> ${application.userEmail}</p>

                    <label>Application Status</label>
                    <select class="application-status"
                        data-application-id="${application.id}">
                        <option value="Applied" ${application.status === "Applied" ? "selected" : ""}>Applied</option>
                        <option value="Shortlisted" ${application.status === "Shortlisted" ? "selected" : ""}>Shortlisted</option>
                        <option value="Selected" ${application.status === "Selected" ? "selected" : ""}>Selected</option>
                        <option value="Rejected" ${application.status === "Rejected" ? "selected" : ""}>Rejected</option>
                    </select>
                </div>
            `).join("")
            : "<p class='muted'>No applications found.</p>";

        document.querySelectorAll(".application-status").forEach(select => {
            select.addEventListener("change", function () {
                const applicationId = Number(this.dataset.applicationId);
                const application = applications.find(item => item.id === applicationId);

                if (application) {
                    application.status = this.value;
                    saveData();
                    alert("Application status updated successfully.");
                }
            });
        });
    }
}

loadAdminPanel();

const profileForm = document.getElementById("profileForm");

function getLatestUser() {
    if (!currentUser) {
        return null;
    }

    return users.find(user => user.email === currentUser.email) || currentUser;
}

function updateProfileCard(user) {
    const profileData = {
        viewProfileName: user.name,
        viewProfileEmail: user.email,
        viewProfilePhone: user.phone,
        viewProfileCourse: user.course,
        viewProfileYear: user.year,
        viewProfileCpi: user.cpi,
        viewProfileSkills: user.skills,
        viewProfileGithub: user.github,
        viewProfileLinkedin: user.linkedin
    };

    Object.keys(profileData).forEach(id => {
        const element = document.getElementById(id);

        if (element) {
            element.textContent = profileData[id] || "Not provided";
        }
    });
}

if (profileForm && currentUser) {
    const user = getLatestUser();

    const profileFields = {
        profileName: "name",
        profileEmail: "email",
        profilePhone: "phone",
        profileCourse: "course",
        profileYear: "year",
        profileCpi: "cpi",
        profileSkills: "skills",
        profileGithub: "github",
        profileLinkedin: "linkedin"
    };

    Object.keys(profileFields).forEach(fieldId => {
        const input = document.getElementById(fieldId);
        const userKey = profileFields[fieldId];

        if (input) {
            input.value = user[userKey] || "";
        }
    });

    const emailInput = document.getElementById("profileEmail");

    if (emailInput) {
        emailInput.readOnly = true;
    }

    updateProfileCard(user);

    profileForm.addEventListener("submit", function(event) {
        event.preventDefault();

        const userIndex = users.findIndex(
            item => item.email === currentUser.email
        );

        if (userIndex === -1) {
            showMessage("profileMessage", "User not found.", "error");
            return;
        }

        Object.keys(profileFields).forEach(fieldId => {
            const input = document.getElementById(fieldId);
            const userKey = profileFields[fieldId];

            if (input && userKey !== "email") {
                users[userIndex][userKey] = input.value.trim();
            }
        });

        const updatedUser = users[userIndex];

        localStorage.setItem(
            "currentUser",
            JSON.stringify(updatedUser)
        );

        saveData();
        updateProfileCard(updatedUser);

        showMessage(
            "profileMessage",
            "Profile saved successfully!",
            "success"
        );
    });
}