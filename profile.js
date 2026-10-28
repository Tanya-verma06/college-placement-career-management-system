
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("profileForm");

    if (!form) return;

    const STORAGE_KEY = "careerNovaProfile";

    const fields = {
        name: "profileName",
        email: "profileEmail",
        phone: "profilePhone",
        course: "profileCourse",
        year: "profileYear",
        cpi: "profileCpi",
        skills: "profileSkills",
        github: "profileGithub",
        linkedin: "profileLinkedin"
    };

    const displayFields = {
        name: "viewProfileName",
        email: "viewProfileEmail",
        phone: "viewProfilePhone",
        course: "viewProfileCourse",
        year: "viewProfileYear",
        cpi: "viewProfileCpi",
        skills: "viewProfileSkills",
        github: "viewProfileGithub",
        linkedin: "viewProfileLinkedin"
    };

    function getProfile() {
        try {
            return JSON.parse(
                localStorage.getItem(STORAGE_KEY) || "{}"
            );
        } catch (error) {
            console.error("Profile loading error:", error);
            return {};
        }
    }

    function showMessage(message, success = true) {
        const messageElement =
            document.getElementById("profileMessage");

        if (messageElement) {
            messageElement.textContent = message;
            messageElement.style.color =
                success ? "#15803d" : "#dc2626";
        }
    }

    function displayProfile(profile) {
        Object.keys(displayFields).forEach(function (key) {
            const element = document.getElementById(
                displayFields[key]
            );

            if (!element) {
                console.warn(
                    "Profile display element not found:",
                    displayFields[key]
                );
                return;
            }

            element.replaceChildren();

            const value = profile[key];

            if (value === undefined || value === null || value === "") {
                element.textContent = "Not provided";
                return;
            }

            if (key === "github" || key === "linkedin") {
                element.textContent = value + " ";

                try {
                    const url = new URL(value);

                    if (url.protocol === "https:" ||
                        url.protocol === "http:") {
                        const link = document.createElement("a");
                        link.href = url.href;
                        link.target = "_blank";
                        link.rel = "noopener noreferrer";
                        link.textContent = "Open";
                        element.appendChild(link);
                    }
                } catch (error) {
                    // Display the entered value as text if it's not a valid URL.
                }
            } else {
                element.textContent = value;
            }
        });
    }

    function loadProfile() {
        const profile = getProfile();

        Object.keys(fields).forEach(function (key) {
            const input = document.getElementById(fields[key]);

            if (input && profile[key] !== undefined) {
                input.value = profile[key];
            }
        });

        displayProfile(profile);
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const profile = {};

        Object.keys(fields).forEach(function (key) {
            const input = document.getElementById(fields[key]);

            if (input) {
                profile[key] = input.value.trim();
            }
        });

        if (!profile.name || !profile.email) {
            showMessage(
                "Please enter your name and email.",
                false
            );
            return;
        }

        try {
            const updatedProfile = {
                ...getProfile(),
                ...profile,
                updatedAt: new Date().toISOString()
            };

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(updatedProfile)
            );

            displayProfile(updatedProfile);
            showMessage("Profile saved successfully!");

        } catch (error) {
            console.error("Profile save error:", error);
            showMessage("Could not save profile.", false);
        }
    });

    loadProfile();
});
