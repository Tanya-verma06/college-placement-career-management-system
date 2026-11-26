const users = JSON.parse(localStorage.getItem("users")) || [];
const jobs = JSON.parse(localStorage.getItem("jobs")) || [];
const applications = JSON.parse(localStorage.getItem("applications")) || [];


const currentUser = JSON.parse(localStorage.getItem("currentUser"));

function saveData() {
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("jobs", JSON.stringify(jobs));
    localStorage.setItem("applications", JSON.stringify(applications));
}

// ==========================================
// SHARED JOB DATABASE
// ==========================================

async function getAllJobs() {

    let defaultJobs = [];

    try {
        const response = await fetch("data.json");

        if (!response.ok) {
            throw new Error("Unable to load default jobs");
        }

        const data = await response.json();
        defaultJobs = data.jobs || [];

    } catch (error) {
        console.error("Default jobs loading error:", error);
    }

    // Combine default jobs and recruiter-posted jobs
    return [...defaultJobs, ...jobs];
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

// Show or hide Course field based on selected role
const registerRole = document.getElementById("registerRole");
const courseFieldGroup = document.getElementById("courseFieldGroup");
const registerCourse = document.getElementById("registerCourse");

function toggleCourseField() {

    if (registerRole.value === "recruiter") {

        courseFieldGroup.style.display = "none";
        registerCourse.value = "";
        registerCourse.required = false;

    } else {

        courseFieldGroup.style.display = "block";
        registerCourse.required = true;

    }

}

if (registerRole && courseFieldGroup && registerCourse) {

    registerRole.addEventListener("change", toggleCourseField);

    // Set the correct visibility when page loads
    toggleCourseField();

}


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
       if (email === "gulshanpachauri4@gmail.com" && password === "7300@.com") {
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

    if (!jobsContainer) return;

    try {

        availableJobs = await getAllJobs();

        displayJobs(availableJobs);

    } catch (error) {

        console.error("Jobs loading error:", error);

        jobsContainer.innerHTML = `
            <div class="empty-state">
                <h2>Unable to Load Jobs</h2>
                <p>Please run the project using Live Server.</p>
            </div>
        `;

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

    if (!jobDetails) return;

    const params = new URLSearchParams(window.location.search);

    const jobId = Number(params.get("id"));

    try {

        const allJobs = await getAllJobs();

        const job = allJobs.find(item => item.id === jobId);

        if (!job) {

            jobDetails.innerHTML = `
                <h2>Job Not Found</h2>
                <p>Requested job is not available.</p>
            `;

            return;
        }

        jobDetails.innerHTML = `

            <h1>${escapeRecruiterHTML(job.title)}</h1>

            <h2>${escapeRecruiterHTML(job.company)}</h2>

            <p>${escapeRecruiterHTML(job.description)}</p>

            <div class="job-meta">

                <span class="badge">${escapeRecruiterHTML(job.type)}</span>

                <span class="badge">${escapeRecruiterHTML(job.location)}</span>

                <span class="badge">${escapeRecruiterHTML(job.package)}</span>

            </div>

            <p>
                <strong>Required Skills:</strong>
                ${job.skills.map(escapeRecruiterHTML).join(", ")}
            </p>

        `;

        const nameInput = document.getElementById("applicantName");

        const emailInput = document.getElementById("applicantEmail");

        if (currentUser) {

            if (nameInput) nameInput.value = currentUser.name || "";

            if (emailInput) emailInput.value = currentUser.email || "";

        }

    } catch (error) {

        console.error(error);

        jobDetails.innerHTML = `
            <h2>Unable to Load Job</h2>
            <p>Please try again.</p>
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

        const allJobs = await getAllJobs();

        const job = allJobs.find(item => item.id === jobId);

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

// ==========================================
// RECRUITER JOB MANAGEMENT
// ==========================================

const jobPostForm = document.getElementById("jobPostForm");

if (jobPostForm) {

    if (!currentUser || currentUser.role !== "recruiter") {
        window.location.href = "login.html";
    }

    const recruiterJobCount =
        document.getElementById("recruiterJobCount");

    const recruiterApplicationCount =
        document.getElementById("recruiterApplicationCount");

    const recruiterJobsContainer =
        document.getElementById("recruiterJobsContainer");

    const recruiterApplicationsContainer =
        document.getElementById("recruiterApplicationsContainer");


    // Display recruiter statistics and posted jobs
    async function loadRecruiterDashboard() {

        const allJobs = await getAllJobs();

        const myJobs = allJobs.filter(job =>
            job.createdBy === currentUser.email
        );

        recruiterJobCount.textContent = myJobs.length;

        const myJobIds = myJobs.map(job => job.id);

        const receivedApplications = applications.filter(application =>
            myJobIds.includes(application.jobId)
        );

        recruiterApplicationCount.textContent =
            receivedApplications.length;


        // Display posted jobs
        if (myJobs.length === 0) {

            recruiterJobsContainer.innerHTML =
                "<p>You haven't posted any jobs yet.</p>";

        } else {

            recruiterJobsContainer.innerHTML = myJobs.map(job => `

                <div class="job-card">

                    <h3>${escapeRecruiterHTML(job.title)}</h3>

                    <p>
                        <strong>Company:</strong>
                        ${escapeRecruiterHTML(job.company)}
                    </p>

                    <p>
                        <strong>Job Type:</strong>
                        ${escapeRecruiterHTML(job.type)}
                    </p>

                    <p>
                        <strong>Location:</strong>
                        ${escapeRecruiterHTML(job.location)}
                    </p>

                    <p>
                        <strong>Salary:</strong>
                        ${escapeRecruiterHTML(job.package)}
                    </p>

                    <p>
                        <strong>Skills:</strong>
                        ${job.skills.map(escapeRecruiterHTML).join(", ")}
                    </p>

                </div>

            `).join("");

        }

        // Display applications received with status update option
        if (receivedApplications.length === 0) {

            recruiterApplicationsContainer.innerHTML =
                "<p>No applications received yet.</p>";

        } else {

            recruiterApplicationsContainer.innerHTML =
                receivedApplications.map(application => `

                    <div class="job-card">

                        <h3>${escapeRecruiterHTML(application.jobTitle)}</h3>

                        <p>
                            <strong>Student:</strong>
                            ${escapeRecruiterHTML(application.userName)}
                        </p>

                        <p>
                            <strong>Email:</strong>
                            ${escapeRecruiterHTML(application.userEmail)}
                        </p>

                        <p>
                            <strong>Applied On:</strong>
                            ${escapeRecruiterHTML(application.appliedAt || "N/A")}
                        </p>

                        <label for="recruiter-status-${application.id}">
                            Update Application Status:
                        </label>

                        <select
                            class="recruiter-application-status"
                            id="recruiter-status-${application.id}"
                            data-application-id="${application.id}">

                            <option value="Applied"
                                ${application.status === "Applied" ? "selected" : ""}>
                                Applied
                            </option>

                            <option value="Shortlisted"
                                ${application.status === "Shortlisted" ? "selected" : ""}>
                                Shortlisted
                            </option>

                            <option value="Selected"
                                ${application.status === "Selected" ? "selected" : ""}>
                                Selected
                            </option>

                            <option value="Rejected"
                                ${application.status === "Rejected" ? "selected" : ""}>
                                Rejected
                            </option>

                        </select>

                    </div>

                `).join("");


    // Handle recruiter status updates
    document.querySelectorAll(".recruiter-application-status")
        .forEach(select => {

            select.addEventListener("change", function() {

                const applicationId = Number(
                    this.dataset.applicationId
                );

                const application = applications.find(
                    item => item.id === applicationId
                );

                if (application) {

                    // Update application status
                    application.status = this.value;

                    // Save updated status in LocalStorage
                    saveData();

                    alert("Application status updated successfully!");

                }

            });

        });

}


    }


    // Handle new job submission
    jobPostForm.addEventListener("submit", async function(event) {

        event.preventDefault();

        const title =
            document.getElementById("jobTitle").value.trim();

        const company =
            document.getElementById("companyName").value.trim();

        const type =
            document.getElementById("jobType").value;

        const location =
            document.getElementById("jobLocation").value;

        const packageValue =
            document.getElementById("jobPackage").value.trim();

        const skills =
            document.getElementById("jobSkills").value
                .split(",")
                .map(skill => skill.trim())
                .filter(skill => skill !== "");

        const description =
            document.getElementById("jobDescription").value.trim();


        if (!title || !company || !type || !location ||
            !packageValue || skills.length === 0 || !description) {

            showMessage(
                "jobPostMessage",
                "Please fill in all job details.",
                "error"
            );

            return;
        }


        // Create a new job
        const newJob = {

            id: Date.now(),

            title: title,
            company: company,
            type: type,
            location: location,
            package: packageValue,
            skills: skills,
            description: description,

            createdBy: currentUser.email,

            postedAt: new Date().toISOString()

        };


        // Save the new job in LocalStorage
        jobs.push(newJob);

        saveData();


        showMessage(
            "jobPostMessage",
            "Job posted successfully! Students can now view this opportunity.",
            "success"
        );


        // Clear the form
        jobPostForm.reset();


        // Refresh recruiter dashboard
        await loadRecruiterDashboard();

    });


    // Initial recruiter dashboard load
    loadRecruiterDashboard();

}


// Escape recruiter-provided content before displaying it
function escapeRecruiterHTML(value) {

    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);

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

    // Run only on Admin Dashboard
    if (!usersContainer && !jobsContainer && !applicationsContainer) {
        return;
    }

    // Check admin login
    if (!currentUser || currentUser.role !== "admin") {
        window.location.href = "login.html";
        return;
    }

    const students = users.filter(user => user.role === "student");
    const recruiters = users.filter(user => user.role === "recruiter");

    // Get ALL jobs from data.json + LocalStorage
    const adminJobs = await getAllJobs();

    // Update dashboard counts
    const studentCount = document.getElementById("adminStudentCount");
    const recruiterCount = document.getElementById("adminRecruiterCount");
    const jobCount = document.getElementById("adminJobCount");
    const applicationCount = document.getElementById("adminApplicationCount");

    if (studentCount) studentCount.textContent = students.length;
    if (recruiterCount) recruiterCount.textContent = recruiters.length;
    if (jobCount) jobCount.textContent = adminJobs.length;
    if (applicationCount) applicationCount.textContent = applications.length;


    // ==================================
    // DISPLAY ALL REGISTERED USERS
    // ==================================

    if (usersContainer) {

        usersContainer.innerHTML = users.length
            ? users.map(user => `
                <div class="job-card">
                    <h3>${escapeRecruiterHTML(user.name)}</h3>
                    <p><strong>Email:</strong> ${escapeRecruiterHTML(user.email)}</p>
                    <p><strong>Role:</strong> ${escapeRecruiterHTML(user.role)}</p>
                </div>
            `).join("")
            : "<p class='muted'>No users found.</p>";

    }


    // ==================================
    // DISPLAY ALL JOBS
    // Includes recruiter-posted jobs
    // ==================================

    
    // ==================================
    // DISPLAY ALL JOBS
    // Show 3 initially, then See More
    // ==================================

    if (jobsContainer) {

        let showAllAdminJobs = false;

        function renderAdminJobs() {

            // Show only 3 jobs initially
            const visibleJobs = showAllAdminJobs
                ? adminJobs
                : adminJobs.slice(0, 3);

            jobsContainer.innerHTML = `

                <div id="adminJobsList"
                    style="
                        max-height: ${showAllAdminJobs ? "400px" : "none"};
                        overflow-y: ${showAllAdminJobs ? "auto" : "visible"};
                        padding-right: 10px;
                    ">

                    ${visibleJobs.map(job => `
                        <div class="job-card">

                            <h3>${escapeRecruiterHTML(job.title)}</h3>

                            <p>
                                <strong>Company:</strong>
                                ${escapeRecruiterHTML(job.company)}
                            </p>

                            <p>
                                <strong>Type:</strong>
                                ${escapeRecruiterHTML(job.type)}
                            </p>

                            <p>
                                <strong>Location:</strong>
                                ${escapeRecruiterHTML(job.location)}
                            </p>

                            <p>
                                <strong>Package:</strong>
                                ${escapeRecruiterHTML(job.package)}
                            </p>

                            <p>
                                <strong>Skills:</strong>
                                ${(job.skills || []).map(escapeRecruiterHTML).join(", ")}
                            </p>

                            <p>
                                <strong>Posted By:</strong>
                                ${escapeRecruiterHTML(job.createdBy || "Default Job")}
                            </p>

                        </div>
                    `).join("")}

                </div>

                ${
                    adminJobs.length > 3
                        ? `
                            <div style="text-align:center; margin-top:15px;">

                                <button
                                    type="button"
                                    id="toggleAdminJobs"
                                    class="btn primary-btn">

                                    ${showAllAdminJobs ? "Show Less" : "See More"}

                                </button>

                            </div>
                        `
                        : ""
                }

            `;

            // Handle See More / Show Less
            const toggleButton = document.getElementById("toggleAdminJobs");

            if (toggleButton) {

                toggleButton.addEventListener("click", function() {

                    showAllAdminJobs = !showAllAdminJobs;

                    renderAdminJobs();

                });

            }

        }

        renderAdminJobs();

    }





    // ==================================
    // DISPLAY ALL APPLICATIONS
    // ==================================

    
if (applicationsContainer) {

    let showAllAdminApplications = false;

    function renderAdminApplications() {

        // Initially show only 3 applications
        const visibleApplications = showAllAdminApplications
            ? applications
            : applications.slice(0, 3);

        applicationsContainer.innerHTML = `

            <div id="adminApplicationsList"
                style="
                    max-height: ${showAllAdminApplications ? "400px" : "none"};
                    overflow-y: ${showAllAdminApplications ? "auto" : "visible"};
                    padding-right: 10px;
                ">

                ${visibleApplications.length
                    ? visibleApplications.map(application => `

                        <div class="job-card">

                            <h3>${escapeRecruiterHTML(application.jobTitle || "Job Application")}</h3>

                            <p>
                                <strong>Company:</strong>
                                ${escapeRecruiterHTML(application.company || "N/A")}
                            </p>

                            <p>
                                <strong>Student:</strong>
                                ${escapeRecruiterHTML(application.userName || "N/A")}
                            </p>

                            <p>
                                <strong>Email:</strong>
                                ${escapeRecruiterHTML(application.userEmail || "N/A")}
                            </p>

                            <label>Application Status</label>

                            <select class="application-status"
                                data-application-id="${application.id}">

                                <option value="Applied"
                                    ${application.status === "Applied" ? "selected" : ""}>
                                    Applied
                                </option>

                                <option value="Shortlisted"
                                    ${application.status === "Shortlisted" ? "selected" : ""}>
                                    Shortlisted
                                </option>

                                <option value="Selected"
                                    ${application.status === "Selected" ? "selected" : ""}>
                                    Selected
                                </option>

                                <option value="Rejected"
                                    ${application.status === "Rejected" ? "selected" : ""}>
                                    Rejected
                                </option>

                            </select>

                        </div>

                    `).join("")
                    : "<p class='muted'>No applications found.</p>"
                }

            </div>

            ${
                applications.length > 3
                    ? `
                        <div style="text-align:center; margin-top:15px;">

                            <button
                                type="button"
                                id="toggleAdminApplications"
                                class="btn primary-btn">

                                ${showAllAdminApplications ? "Show Less" : "See More"}

                            </button>

                        </div>
                    `
                    : ""
            }

        `;


        // See More / Show Less button
        const toggleButton = document.getElementById(
            "toggleAdminApplications"
        );

        if (toggleButton) {

            toggleButton.addEventListener("click", function() {

                showAllAdminApplications = !showAllAdminApplications;

                renderAdminApplications();

            });

        }


        // Application status updates
        document.querySelectorAll(".application-status").forEach(select => {

            select.addEventListener("change", function() {

                const applicationId = Number(this.dataset.applicationId);

                const application = applications.find(
                    item => item.id === applicationId
                );

                if (application) {

                    application.status = this.value;

                    saveData();

                    alert("Application status updated successfully.");

                }

            });

        });

    }

    // Initial rendering
    renderAdminApplications();

}


}

// Load Admin Dashboard
loadAdminPanel();


// const profileForm = document.getElementById("profileForm");

// function getLatestUser() {
//     if (!currentUser) return null;

//     return users.find(user => user.email === currentUser.email) || currentUser;
// }

// function updateProfileCard(user) {
//     const profileData = {
//         viewProfileName: user.name,
//         viewProfileEmail: user.email,
//         viewProfilePhone: user.phone,
//         viewProfileCourse: user.course,
//         viewProfileYear: user.year,
//         viewProfileCpi: user.cpi,
//         viewProfileSkills: user.skills,
//         viewProfileGithub: user.github,
//         viewProfileLinkedin: user.linkedin
//     };

//     Object.keys(profileData).forEach(id => {
//         const element = document.getElementById(id);

//         if (element) {
//             element.textContent = profileData[id] || "Not provided";
//         }
//     });
// }

// if (profileForm && currentUser) {
//     const user = getLatestUser();

//     const profileFields = {
//         profileName: "name",
//         profilePhone: "phone",
//         profileCourse: "course",
//         profileYear: "year",
//         profileCpi: "cpi",
//         profileSkills: "skills",
//         profileGithub: "github",
//         profileLinkedin: "linkedin"
//     };

//     Object.keys(profileFields).forEach(fieldId => {
//         const input = document.getElementById(fieldId);

//         if (input) {
//             input.value = user[profileFields[fieldId]] || "";
//         }
//     });

//     const emailInput = document.getElementById("profileEmail");

//     if (emailInput) {
//         emailInput.readOnly = false;
//         emailInput.value = user.email || "";
//     }

//     updateProfileCard(user);

//     profileForm.addEventListener("submit", function(event) {
//         event.preventDefault();

//         const userIndex = users.findIndex(
//             item => item.email === currentUser.email
//         );

//         if (userIndex === -1) {
//             showMessage("profileMessage", "User not found.", "error");
//             return;
//         }

//         const newEmail = emailInput
//             ? emailInput.value.trim().toLowerCase()
//             : users[userIndex].email;

//         if (!newEmail) {
//             showMessage("profileMessage", "Email cannot be empty.", "error");
//             return;
//         }

//         const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//         if (!emailPattern.test(newEmail)) {
//             showMessage("profileMessage", "Please enter a valid email address.", "error");
//             return;
//         }

//         const emailExists = users.some(
//             (item, index) =>
//                 index !== userIndex &&
//                 item.email.toLowerCase() === newEmail
//         );

//         if (emailExists) {
//             showMessage("profileMessage", "This email is already registered.", "error");
//             return;
//         }

//         const oldEmail = users[userIndex].email;

//         Object.keys(profileFields).forEach(fieldId => {
//             const input = document.getElementById(fieldId);

//             if (input) {
//                 users[userIndex][profileFields[fieldId]] = input.value.trim();
//             }
//         });

//         users[userIndex].email = newEmail;

//         applications.forEach(application => {
//             if (application.userEmail === oldEmail) {
//                 application.userEmail = newEmail;
//                 application.userName = users[userIndex].name;
//             }
//         });

//         Object.assign(currentUser, users[userIndex]);

//         localStorage.setItem(
//             "currentUser",
//             JSON.stringify(currentUser)
//         );

//         saveData();
//         updateProfileCard(users[userIndex]);

//         if (emailInput) {
//             emailInput.value = newEmail;
//         }

//         showMessage(
//             "profileMessage",
//             "Profile and email updated successfully. Use your new email for your next login.",
//             "success"
//         );
//     });
// }


// ==========================================
// STUDENT PROFILE MANAGEMENT
// ==========================================

const profileForm = document.getElementById("profileForm");

if (profileForm && currentUser) {

    const profileEditCard = document.getElementById("profileEditCard");
    const studentProfileCard = document.getElementById("studentProfileCard");

    const editProfileBtn = document.getElementById("editProfileBtn");
    const cancelProfileEdit = document.getElementById("cancelProfileEdit");

    const profileMessage = document.getElementById("profileMessage");

    const emailInput = document.getElementById("profileEmail");

    // Get the latest user information
    function getLatestUser() {
        return users.find(user =>
            user.email === currentUser.email
        ) || currentUser;
    }

    let user = getLatestUser();

    // Fields connected with user data
    const profileFields = {
        profileName: "name",
        profilePhone: "phone",
        profileCourse: "course",
        profileYear: "year",
        profileCpi: "cpi",
        profileSkills: "skills",
        profileGithub: "github",
        profileLinkedin: "linkedin"
    };


    // Fill the edit form with existing data
    function fillProfileForm(userData) {

        Object.keys(profileFields).forEach(fieldId => {

            const input = document.getElementById(fieldId);

            if (input) {
                input.value = userData[profileFields[fieldId]] || "";
            }

        });

        emailInput.value = userData.email || "";
    }


    // Display student profile information
    function updateProfileCard(userData) {

        const profileData = {
            viewProfileName: userData.name,
            viewProfileEmail: userData.email,
            viewProfilePhone: userData.phone,
            viewProfileCourse: userData.course,
            viewProfileYear: userData.year,
            viewProfileCpi: userData.cpi,
            viewProfileSkills: userData.skills,
            viewProfileGithub: userData.github,
            viewProfileLinkedin: userData.linkedin
        };

        Object.keys(profileData).forEach(id => {

            const element = document.getElementById(id);

            if (element) {
                element.textContent = profileData[id] || "Not provided";
            }

        });
    }


    // Check whether the student has saved profile information
    function hasSavedProfile(userData) {

        return userData.profileCompleted === true ||
            ["phone", "year", "cpi", "skills", "github", "linkedin"]
                .some(field => String(userData[field] || "").trim() !== "");
    }


    // Show profile view
    function showProfileView() {

        profileEditCard.style.display = "none";
        studentProfileCard.style.display = "block";

        updateProfileCard(getLatestUser());
    }


    // Show profile edit form
    function showProfileEdit() {

        user = getLatestUser();

        fillProfileForm(user);

        profileMessage.textContent = "";
        profileEditCard.style.display = "block";
        studentProfileCard.style.display = "none";
    }


    // Initial page setup
    updateProfileCard(user);
    fillProfileForm(user);

    if (hasSavedProfile(user)) {

        // Existing profile: Show only student profile
        showProfileView();

    } else {

        // First-time profile: Show form
        profileEditCard.style.display = "block";
        studentProfileCard.style.display = "none";

    }


    // Edit button
    editProfileBtn.addEventListener("click", function() {
        showProfileEdit();
    });


    // Cancel editing
    cancelProfileEdit.addEventListener("click", function() {

        showProfileView();

    });


    // Save updated profile
    profileForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const userIndex = users.findIndex(
            item => item.email === currentUser.email
        );

        if (userIndex === -1) {
            showMessage("profileMessage", "User not found.", "error");
            return;
        }

        const newEmail = emailInput.value.trim().toLowerCase();

        if (!newEmail) {
            showMessage("profileMessage", "Email cannot be empty.", "error");
            return;
        }

        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(newEmail)) {
            showMessage("profileMessage", "Please enter a valid email address.", "error");
            return;
        }

        // Check duplicate email
        const emailExists = users.some(
            (item, index) =>
                index !== userIndex &&
                item.email.toLowerCase() === newEmail
        );

        if (emailExists) {
            showMessage("profileMessage", "This email is already registered.", "error");
            return;
        }

        const oldEmail = users[userIndex].email;

        // Update all profile fields
        Object.keys(profileFields).forEach(fieldId => {

            const input = document.getElementById(fieldId);

            if (input) {
                users[userIndex][profileFields[fieldId]] =
                    input.value.trim();
            }

        });

        users[userIndex].email = newEmail;

        // Mark profile as completed
        users[userIndex].profileCompleted = true;

        // Update existing applications if email changes
        applications.forEach(application => {

            if (application.userEmail === oldEmail) {

                application.userEmail = newEmail;
                application.userName = users[userIndex].name;

            }

        });

        // Update current logged-in user
        Object.assign(currentUser, users[userIndex]);

        localStorage.setItem(
            "currentUser",
            JSON.stringify(currentUser)
        );

        // Save all updated data
        saveData();

        // Update displayed profile
        updateProfileCard(users[userIndex]);

        // Return to profile view
        showProfileView();

        showMessage(
            "profileMessage",
            "Profile updated successfully!",
            "success"
        );

    });

}



// ==========================================
// CAREER RECOMMENDATION SYSTEM
// ==========================================

const careerForm = document.getElementById("careerForm");

if (careerForm) {

    const careerResult = document.getElementById("careerResult");

    // Career paths based on selected interest
    const careerPaths = {

        "Web Development": [
            {
                title: "Frontend Developer",
                description: "Develop user-friendly websites and interactive interfaces.",
                skills: ["html", "css", "javascript", "react", "typescript"],
                next: ["React.js", "Responsive Design", "TypeScript"]
            },
            {
                title: "Backend Developer",
                description: "Build server-side applications, APIs and database systems.",
                skills: ["node.js", "express", "python", "java", "sql", "mongodb"],
                next: ["REST APIs", "Database Management", "Authentication"]
            },
            {
                title: "Full Stack Developer",
                description: "Work on both frontend and backend development.",
                skills: ["html", "css", "javascript", "react", "node.js", "sql"],
                next: ["MERN Stack", "API Integration", "Deployment"]
            }
        ],

        "Cloud Computing": [
            {
                title: "Cloud Engineer",
                description: "Design, deploy and maintain cloud infrastructure.",
                skills: ["aws", "azure", "linux", "networking", "python"],
                next: ["AWS Services", "Linux", "Cloud Architecture"]
            },
            {
                title: "DevOps Engineer",
                description: "Automate software development and deployment processes.",
                skills: ["docker", "kubernetes", "linux", "git", "python"],
                next: ["CI/CD", "Docker", "Kubernetes"]
            },
            {
                title: "Cloud Architect",
                description: "Design scalable and reliable cloud-based systems.",
                skills: ["aws", "azure", "networking", "security", "sql"],
                next: ["Cloud Architecture", "System Design", "Security"]
            }
        ],

        "Data Science": [
            {
                title: "Data Analyst",
                description: "Analyze datasets and generate meaningful business insights.",
                skills: ["python", "sql", "excel", "power bi", "statistics"],
                next: ["Pandas", "Power BI", "Data Visualization"]
            },
            {
                title: "Machine Learning Engineer",
                description: "Develop and deploy machine learning models.",
                skills: ["python", "numpy", "pandas", "machine learning", "scikit-learn"],
                next: ["Machine Learning", "Model Evaluation", "Deep Learning"]
            },
            {
                title: "Data Scientist",
                description: "Use statistics and machine learning to solve complex problems.",
                skills: ["python", "sql", "statistics", "machine learning", "pandas"],
                next: ["Advanced Statistics", "Machine Learning", "Data Storytelling"]
            }
        ],

        "Cyber Security": [
            {
                title: "Security Analyst",
                description: "Monitor systems and identify potential security threats.",
                skills: ["networking", "linux", "python", "security"],
                next: ["Network Security", "SIEM Tools", "Threat Detection"]
            },
            {
                title: "Penetration Tester",
                description: "Test applications and networks to identify vulnerabilities.",
                skills: ["linux", "python", "networking", "security", "javascript"],
                next: ["Ethical Hacking", "Web Security", "OWASP"]
            },
            {
                title: "Security Engineer",
                description: "Build and maintain secure systems and applications.",
                skills: ["python", "networking", "linux", "security", "aws"],
                next: ["Application Security", "Cloud Security", "Cryptography"]
            }
        ],

        "Software Development": [
            {
                title: "Software Engineer",
                description: "Design, develop and maintain software applications.",
                skills: ["java", "python", "c++", "javascript", "dsa"],
                next: ["Data Structures", "Algorithms", "System Design"]
            },
            {
                title: "Java Developer",
                description: "Build applications using Java and object-oriented programming.",
                skills: ["java", "oops", "sql", "spring boot", "dsa"],
                next: ["Spring Boot", "JDBC", "Advanced Java"]
            },
            {
                title: "Application Developer",
                description: "Develop and maintain desktop, web and mobile applications.",
                skills: ["java", "python", "javascript", "sql", "git"],
                next: ["Application Architecture", "APIs", "Testing"]
            }
        ]
    };

    // Normalize skills before comparing them
    function normalizeSkill(skill) {

        const value = skill.toLowerCase().trim();

        const aliases = {
            "js": "javascript",
            "react.js": "react",
            "reactjs": "react",
            "node": "node.js",
            "nodejs": "node.js",
            "mongodb": "mongodb",
            "mongo": "mongodb",
            "powerbi": "power bi",
            "scikit learn": "scikit-learn",
            "ml": "machine learning",
            "ds and algo": "dsa",
            "data structures and algorithms": "dsa",
            "object oriented programming": "oops"
        };

        return aliases[value] || value;
    }

    // Generate career recommendations
    function generateCareerRecommendations(interest, skills, experience) {

        const paths = careerPaths[interest];

        const studentSkills = skills
            .split(",")
            .map(skill => normalizeSkill(skill))
            .filter(skill => skill.length > 0);

        const experienceBonus = {
            "Beginner": 0,
            "Intermediate": 5,
            "Advanced": 10
        };

        const recommendations = paths.map(career => {

            const matchedSkills = career.skills.filter(skill =>
                studentSkills.includes(skill)
            );

            const missingSkills = career.skills.filter(skill =>
                !studentSkills.includes(skill)
            );

            const matchPercentage = Math.round(
                (matchedSkills.length / career.skills.length) * 100
            );

            const score = Math.min(
                95,
                Math.round(35 + matchPercentage * 0.55 +
                (experienceBonus[experience] || 0))
            );

            return {
                ...career,
                matchedSkills,
                missingSkills,
                matchPercentage,
                score
            };

        });

        // Highest matching career appears first
        recommendations.sort((a, b) => b.score - a.score);

        return recommendations;
    }

    // Handle form submission
    careerForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const interest = document.getElementById("careerInterest").value;

        const skills = document.getElementById("careerSkills").value.trim();

        const experience = document.getElementById("careerExperience").value;

        if (!interest || !skills || !experience) {
            alert("Please complete all fields.");
            return;
        }

        const recommendations = generateCareerRecommendations(
            interest,
            skills,
            experience
        );

        const topCareer = recommendations[0];

        careerResult.innerHTML = `
            <h2>Your Career Recommendations</h2>

            <p>
                Based on your interest in
                <strong>${interest}</strong>,
                your skills and experience.
            </p>

            ${recommendations.map((career, index) => `

                <div style="
                    padding: 18px;
                    margin-top: 18px;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    background: ${index === 0 ? '#eef2ff' : '#ffffff'};
                ">

                    <h3 style="color:#3730a3; margin-top:0;">
                        ${index + 1}. ${career.title}
                        ${index === 0 ? " ⭐ Best Match" : ""}
                    </h3>

                    <p>${career.description}</p>

                    <p>
                        <strong>Compatibility Score:</strong>
                        ${career.score}%
                    </p>

                    <div style="
                        background:#e2e8f0;
                        height:8px;
                        border-radius:10px;
                        overflow:hidden;
                    ">
                        <div style="
                            width:${career.score}%;
                            height:100%;
                            background:#4f46e5;
                        "></div>
                    </div>

                    <p>
                        <strong>Skills You Have:</strong>
                        ${career.matchedSkills.length
                            ? career.matchedSkills.join(", ")
                            : "No matching skills identified yet"}
                    </p>

                    <p>
                        <strong>Skills to Learn:</strong>
                        ${career.missingSkills.join(", ") || "You have all listed skills!"}
                    </p>

                    <p>
                        <strong>Recommended Next Steps:</strong>
                        ${career.next.join(", ")}
                    </p>

                </div>

            `).join("")}

            <p style="
                margin-top:20px;
                font-size:12px;
                color:#64748b;
            ">
                These recommendations are generated using a
                rule-based skill matching system.
                They are guidance, not a guarantee of job suitability.
            </p>
        `;

    });

}



// ==========================================
// SKILL GAP ANALYSIS SYSTEM
// ==========================================

const skillGapForm = document.getElementById("skillGapForm");

if (skillGapForm) {

    const skillGapResult = document.getElementById("skillGapResult");

    // Required skills for different job roles
    const roleSkills = {

        "Frontend Developer": {
            skills: [
                "HTML",
                "CSS",
                "JavaScript",
                "React",
                "Responsive Design",
                "Git"
            ],
            roadmap: [
                "Learn HTML5 and semantic HTML",
                "Master CSS, Flexbox and Grid",
                "Practice JavaScript and DOM manipulation",
                "Build projects using React.js",
                "Learn responsive web design",
                "Understand Git and GitHub"
            ]
        },

        "Backend Developer": {
            skills: [
                "Python",
                "Java",
                "Node.js",
                "SQL",
                "REST API",
                "Database Management"
            ],
            roadmap: [
                "Strengthen Python or Java fundamentals",
                "Learn Node.js and Express",
                "Understand SQL and database design",
                "Build REST APIs",
                "Learn authentication and authorization",
                "Practice backend project development"
            ]
        },

        "Full Stack Developer": {
            skills: [
                "HTML",
                "CSS",
                "JavaScript",
                "React",
                "Node.js",
                "SQL",
                "Git",
                "REST API"
            ],
            roadmap: [
                "Master HTML, CSS and JavaScript",
                "Learn React for frontend development",
                "Learn Node.js and Express",
                "Understand SQL and MongoDB",
                "Practice REST API integration",
                "Build and deploy full-stack projects"
            ]
        },

        "Cloud Engineer": {
            skills: [
                "Linux",
                "Networking",
                "AWS",
                "Azure",
                "Docker",
                "Python",
                "Cloud Security"
            ],
            roadmap: [
                "Learn Linux commands",
                "Understand computer networking",
                "Study AWS or Microsoft Azure",
                "Practice Docker containers",
                "Learn cloud security fundamentals",
                "Deploy applications on cloud platforms"
            ]
        },

        "Software Developer": {
            skills: [
                "Java",
                "Python",
                "C++",
                "Data Structures",
                "Algorithms",
                "OOP",
                "SQL",
                "Git"
            ],
            roadmap: [
                "Strengthen Java or Python programming",
                "Learn Object-Oriented Programming",
                "Practice Data Structures and Algorithms",
                "Understand SQL and databases",
                "Learn Git and GitHub",
                "Build real-world software projects"
            ]
        },

        "Data Analyst": {
            skills: [
                "Python",
                "SQL",
                "Excel",
                "Statistics",
                "Pandas",
                "Power BI",
                "Data Visualization"
            ],
            roadmap: [
                "Learn Python fundamentals",
                "Practice Pandas and NumPy",
                "Master SQL queries",
                "Understand statistics",
                "Learn Power BI or Tableau",
                "Create data analysis projects"
            ]
        }
    };


    // Normalize skill names
    function normalizeGapSkill(skill) {

        const value = skill.toLowerCase().trim();

        const aliases = {
            "js": "javascript",
            "react.js": "react",
            "reactjs": "react",
            "node": "node.js",
            "nodejs": "node.js",
            "postgresql": "sql",
            "mysql": "sql",
            "mongodb": "database management",
            "powerbi": "power bi",
            "power-bi": "power bi",
            "dsa": "data structures",
            "data structures and algorithms": "data structures",
            "oops": "oop",
            "object oriented programming": "oop",
            "rest apis": "rest api",
            "api": "rest api",
            "aws cloud": "aws",
            "ms azure": "azure",
            "tableau": "data visualization"
        };

        return aliases[value] || value;
    }


    // Escape user-provided text before inserting into HTML
    function escapeGapHTML(value) {
        return String(value).replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        })[character]);
    }


    // Generate Skill Gap Report
    function generateSkillGap(role, enteredSkills, level) {

        const roleData = roleSkills[role];

        if (!roleData) {
            return null;
        }

        const studentSkills = enteredSkills
            .split(",")
            .map(skill => normalizeGapSkill(skill))
            .filter(skill => skill !== "");

        const requiredSkills = roleData.skills;

        // Find matching skills
        const matchedSkills = requiredSkills.filter(skill =>
            studentSkills.includes(normalizeGapSkill(skill))
        );

        // Find missing skills
        const missingSkills = requiredSkills.filter(skill =>
            !studentSkills.includes(normalizeGapSkill(skill))
        );

        // Find additional skills
        const additionalSkills = studentSkills.filter(skill =>
            !requiredSkills.some(required =>
                normalizeGapSkill(required) === skill
            )
        );

        // Calculate skill coverage
        const skillCoverage = Math.round(
            (matchedSkills.length / requiredSkills.length) * 100
        );

        // Select learning priority based on skill level
        let priority;

        if (level === "Beginner") {
            priority = "Focus on building strong fundamentals first.";
        } else if (level === "Intermediate") {
            priority = "Focus on practical projects and strengthening missing skills.";
        } else {
            priority = "Focus on advanced concepts, specialization and industry-level projects.";
        }

        return {
            role,
            level,
            matchedSkills,
            missingSkills,
            additionalSkills,
            skillCoverage,
            priority,
            roadmap: roleData.roadmap
        };
    }


    // Display Skill Gap Report
    function displaySkillGapReport(report) {

        const matchedHTML = report.matchedSkills.length
            ? report.matchedSkills.map(skill =>
                `<span class="skill-tag">${escapeGapHTML(skill)}</span>`
            ).join("")
            : "<p>No matching skills identified yet.</p>";

        const missingHTML = report.missingSkills.length
            ? report.missingSkills.map(skill =>
                `<span class="skill-tag">${escapeGapHTML(skill)}</span>`
            ).join("")
            : "<p>Excellent! You have all the listed required skills.</p>";

        const additionalHTML = report.additionalSkills.length
            ? report.additionalSkills.map(skill =>
                `<span class="skill-tag">${escapeGapHTML(skill)}</span>`
            ).join("")
            : "<p>No additional skills identified.</p>";

        skillGapResult.innerHTML = `

            <h2>Skill Gap Analysis Report</h2>

            <h3>${escapeGapHTML(report.role)}</h3>

            <p>
                <strong>Current Level:</strong>
                ${escapeGapHTML(report.level)}
            </p>

            <div style="
                margin:20px 0;
                padding:18px;
                background:#eef2ff;
                border-radius:12px;
            ">

                <h3>Skill Coverage</h3>

                <h1 style="color:#4f46e5;">
                    ${report.skillCoverage}%
                </h1>

                <div style="
                    height:12px;
                    background:#dbeafe;
                    border-radius:10px;
                    overflow:hidden;
                ">
                    <div style="
                        width:${report.skillCoverage}%;
                        height:100%;
                        background:#4f46e5;
                    "></div>
                </div>

                <p>
                    ${report.matchedSkills.length}
                    out of
                    ${report.matchedSkills.length + report.missingSkills.length}
                    required skills matched.
                </p>

            </div>

            <div style="margin-top:20px;">

                <h3>Skills You Already Have</h3>

                <div>${matchedHTML}</div>

            </div>

            <div style="margin-top:20px;">

                <h3>Missing Skills</h3>

                <div>${missingHTML}</div>

            </div>

            <div style="margin-top:20px;">

                <h3>Additional Skills</h3>

                <div>${additionalHTML}</div>

            </div>

            <div style="
                margin-top:20px;
                padding:15px;
                background:#f8fafc;
                border-radius:10px;
            ">

                <h3>Personalized Learning Roadmap</h3>

                <p>${escapeGapHTML(report.priority)}</p>

                <ol>
                    ${report.roadmap.map(step =>
                        `<li>${escapeGapHTML(step)}</li>`
                    ).join("")}
                </ol>

            </div>

            <p style="
                margin-top:15px;
                color:#64748b;
                font-size:12px;
            ">
                This analysis compares your entered skills against
                predefined requirements for the selected job role.
                It is an indicative skill coverage score.
            </p>

        `;
    }


    // Handle form submission
    skillGapForm.addEventListener("submit", function(event) {

        event.preventDefault();

        const targetRole =
            document.getElementById("targetRole").value;

        const currentSkills =
            document.getElementById("currentSkills").value.trim();

        const skillLevel =
            document.getElementById("skillLevel").value;

        if (!targetRole || !currentSkills || !skillLevel) {
            alert("Please fill in all the fields.");
            return;
        }

        const report = generateSkillGap(
            targetRole,
            currentSkills,
            skillLevel
        );

        if (!report) {
            alert("Unable to generate skill gap analysis.");
            return;
        }

        displaySkillGapReport(report);

    });

}



// ==========================================
// STUDENT DASHBOARD - DYNAMIC STATISTICS
// ==========================================

async function updateStudentDashboard() {

    // Run only on dashboard page
    const totalJobsElement = document.getElementById("totalJobs");

    if (!totalJobsElement) return;

    if (!currentUser) return;

    const applicationsElement =
        document.getElementById("totalApplications");

    const shortlistedElement =
        document.getElementById("shortlistedCount");

    const profileStatusElement =
        document.getElementById("profileStatus");

    const recentActivitiesElement =
        document.getElementById("recentActivities");


    // Get latest user information
    const latestUser = users.find(
        user => user.email === currentUser.email
    ) || currentUser;


    
    // 1. TOTAL JOBS
    // Get default jobs + recruiter-posted jobs

    try {

        const allJobs = await getAllJobs();

        totalJobsElement.textContent = allJobs.length;

    } catch (error) {

        console.error("Dashboard jobs error:", error);

        totalJobsElement.textContent = "0";

    }



    // 2. APPLICATIONS
    // Count only applications of logged-in student

    const studentApplications = applications.filter(
        application =>
            application.userEmail === currentUser.email
    );

    applicationsElement.textContent =
        studentApplications.length;


    // 3. SHORTLISTED APPLICATIONS

    const shortlistedApplications = studentApplications.filter(
        application =>
            application.status &&
            application.status.toLowerCase() === "shortlisted"
    );

    shortlistedElement.textContent =
        shortlistedApplications.length;


    // 4. PROFILE STATUS

    const profileCompleted =
        latestUser.profileCompleted === true ||
        (
            latestUser.phone &&
            latestUser.course &&
            latestUser.year &&
            latestUser.cpi !== undefined &&
            latestUser.cpi !== null &&
            String(latestUser.cpi).trim() !== ""
        );

    if (profileCompleted) {

        profileStatusElement.textContent = "Completed";
        profileStatusElement.style.color = "#16a34a";

    } else {

        profileStatusElement.textContent = "Pending";
        profileStatusElement.style.color = "#dc2626";

    }


    // 5. RECENT ACTIVITIES

    if (recentActivitiesElement) {

        if (studentApplications.length === 0) {

            recentActivitiesElement.innerHTML = `
                <p>No recent activities available.</p>
                <p>Start by exploring jobs and applying for opportunities!</p>
            `;

        } else {

            const recentApplications = [...studentApplications]
                .sort((a, b) => Number(b.id || 0) - Number(a.id || 0))
                .slice(0, 5);

            recentActivitiesElement.innerHTML =
                recentApplications.map(application => {

                    const title = escapeDashboardHTML(
                        application.jobTitle || "Job Application"
                    );

                    const company = escapeDashboardHTML(
                        application.company || "Company"
                    );

                    const status = escapeDashboardHTML(
                        application.status || "Applied"
                    );

                    const date = escapeDashboardHTML(
                        application.appliedAt || ""
                    );

                    return `
                        <p style="
                            padding:12px 0;
                            border-bottom:1px solid #e2e8f0;
                        ">
                            <strong>${title}</strong>
                            <br>
                            <span>${company}</span>
                            <br>
                            <small>Applied on: ${date}</small>
                            <br>
                            <span style="color:#4f46e5;">
                                Status: ${status}
                            </span>
                        </p>
                    `;

                }).join("");

        }

    }

}


// Escape dynamic text before displaying it
function escapeDashboardHTML(value) {

    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);

}


// Execute dashboard updates
updateStudentDashboard();