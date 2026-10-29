
document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById("applicationsContainer");
    const filter = document.getElementById("applicationStatusFilter");

    if (!container) {
        console.error("Applications container not found!");
        return;
    }

    // Get saved applications
    function getApplications() {
        try {
            return JSON.parse(
                localStorage.getItem("careerNovaApplications") || "[]"
            );
        } catch (error) {
            console.error("Unable to read applications:", error);
            return [];
        }
    }

    // Display applications
    function displayApplications() {
        const applications = getApplications();
        const selectedStatus = filter ? filter.value : "";

        const filteredApplications = applications.filter(function (app) {
            if (!selectedStatus || selectedStatus === "") {
                return true;
            }

            return (app.status || "Applied").toLowerCase() ===
                   selectedStatus.toLowerCase();
        });

        container.innerHTML = "";

        if (filteredApplications.length === 0) {
            const empty = document.createElement("div");
            empty.className = "career-app-empty";

            const heading = document.createElement("h2");
            const message = document.createElement("p");

            if (applications.length === 0) {
                heading.textContent = "No Applications Yet";
                message.textContent =
                    "Visit your dashboard and apply for a job to get started.";
            } else {
                heading.textContent = "No Matching Applications";
                message.textContent =
                    "Try selecting a different application status.";
            }

            const link = document.createElement("a");
            link.href = "dashboard.html";
            link.textContent = "Explore Jobs →";

            empty.append(heading, message, link);
            container.appendChild(empty);
            return;
        }

        filteredApplications.forEach(function (app) {
            const card = document.createElement("article");
            card.className = "career-application-card";

            const title = document.createElement("h3");
            title.textContent =
                app.jobTitle || app.title || app.role || "Job Application";

            const status = document.createElement("span");
            status.className = "application-status";
            status.textContent = app.status || "Applied";

            const date = document.createElement("p");

            if (app.appliedAt) {
                date.textContent =
                    "Applied on: " +
                    new Date(app.appliedAt).toLocaleDateString();
            } else {
                date.textContent = "Application submitted";
            }

            card.append(title, status, date);
            container.appendChild(card);
        });
    }

    // Filter applications when status changes
    if (filter) {
        filter.addEventListener("change", displayApplications);
    }

    // Display data initially
    displayApplications();
});

document.addEventListener("DOMContentLoaded", function () {

    // Run this functionality only on profile.html
    if (!window.location.pathname.toLowerCase().endsWith("profile.html")) {
        return;
    }

    const STORAGE_KEY = "careerNovaProfile";

    // Find the profile form
    const profileForm =
        document.querySelector("#profileForm") ||
        document.querySelector(".profile-form") ||
        document.querySelector("form");

    if (!profileForm) {
        console.warn(
            "Profile form not found. Please check profile.html."
        );
        return;
    }

    // Find fields using their name or id
    function findField(possibleNames) {
        for (const name of possibleNames) {
            const field =
                profileForm.querySelector(`[name="${name}"]`) ||
                profileForm.querySelector(`#${name}`);

            if (field) {
                return field;
            }
        }

        return null;
    }

    const fields = {
        name: findField(["name", "fullName", "studentName", "student_name"]),
        email: findField(["email", "studentEmail", "student_email"]),
        phone: findField(["phone", "mobile", "phoneNumber"]),
        course: findField(["course", "degree", "education"]),
        skills: findField(["skills", "technicalSkills"]),
        linkedin: findField(["linkedin", "linkedinUrl"]),
        github: findField(["github", "githubUrl"])
    };

    // Show notifications
    function showMessage(message) {
        let notification = document.getElementById("profileNotification");

        if (!notification) {
            notification = document.createElement("div");
            notification.id = "profileNotification";

            Object.assign(notification.style, {
                position: "fixed",
                bottom: "20px",
                right: "20px",
                zIndex: "9999",
                padding: "14px 20px",
                borderRadius: "12px",
                background: "#172554",
                color: "#ffffff",
                boxShadow: "0 8px 25px #0002",
                fontWeight: "600"
            });

            document.body.appendChild(notification);
        }

        notification.textContent = message;
        notification.style.display = "block";

        clearTimeout(showMessage.timer);

        showMessage.timer = setTimeout(function () {
            notification.style.display = "none";
        }, 2500);
    }

    // Load saved profile
    function loadProfile() {
        let profile = {};

        try {
            profile = JSON.parse(
                localStorage.getItem(STORAGE_KEY) || "{}"
            );
        } catch (error) {
            console.error("Unable to load profile:", error);
        }

        Object.keys(fields).forEach(function (key) {
            const field = fields[key];

            if (field && profile[key] !== undefined) {
                field.value = profile[key];
            }
        });
    }

    // Save profile
    profileForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const profile = {};

        Object.keys(fields).forEach(function (key) {
            const field = fields[key];

            if (field) {
                profile[key] = field.value.trim();
            }
        });

        if (fields.name && !profile.name) {
            showMessage("Please enter your name.");
            fields.name.focus();
            return;
        }

        if (fields.email && !profile.email) {
            showMessage("Please enter your email.");
            fields.email.focus();
            return;
        }

        try {
            // Preserve any existing profile properties
            const previousProfile = JSON.parse(
                localStorage.getItem(STORAGE_KEY) || "{}"
            );

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    ...previousProfile,
                    ...profile,
                    updatedAt: new Date().toISOString()
                })
            );

            showMessage("Profile saved successfully!");

        } catch (error) {
            console.error("Unable to save profile:", error);
            showMessage("Unable to save. Please try again.");
        }
    });

    // Restore profile whenever the page opens
    loadProfile();

});
