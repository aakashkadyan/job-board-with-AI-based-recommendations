// Check authentication and load user data
window.onload = function() {
    const userData = localStorage.getItem('userData');
    if (!userData) {
        // Redirect to login if not authenticated
        window.location.href = '/login';
        return;
    }

    const user = JSON.parse(userData);
    document.getElementById('userName').textContent = user.name;
    
    // Load initial data
    loadJobRecommendations();
    loadPastApplications();
    loadSavedJobs();
};

// Tab switching functionality
function switchTab(tabName, event) {
    // Update navigation items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    event.currentTarget.classList.add('active');

    // Update content sections
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');

    // Update URL hash
    window.location.hash = tabName;
}

// Job search functionality
function searchJobs() {
    const searchQuery = document.getElementById('job-search').value;
    const location = document.getElementById('job-location').value;
    
    // Show loading state
    const searchResults = document.getElementById('search-results');
    searchResults.innerHTML = '<div class="loading">Searching jobs...</div>';

    // Make API call to search jobs
    fetch(`/api/jobs/search?q=${searchQuery}&location=${location}`)
        .then(response => response.json())
        .then(jobs => {
            displayJobResults(jobs);
        })
        .catch(error => {
            searchResults.innerHTML = '<div class="error">Error loading jobs. Please try again.</div>';
        });
}

// Display job search results
function displayJobResults(jobs) {
    const searchResults = document.getElementById('search-results');
    if (!jobs.length) {
        searchResults.innerHTML = '<div class="no-results">No jobs found matching your criteria.</div>';
        return;
    }

    searchResults.innerHTML = jobs.map(job => `
        <div class="job-card">
            <h3>${job.title}</h3>
            <div class="job-meta">
                <span>${job.company}</span>
                <span>${job.location}</span>
                <span>${job.type}</span>
            </div>
            <p>${job.description}</p>
            <div class="job-actions">
                <button onclick="applyForJob('${job._id}')" class="btn primary">Apply Now</button>
                <button onclick="saveJob('${job._id}')" class="btn secondary">Save Job</button>
            </div>
        </div>
    `).join('');
}

// Load job recommendations
function loadJobRecommendations() {
    const skillsContainer = document.getElementById('skills-recommendations');
    const preferencesContainer = document.getElementById('preferences-recommendations');

    // Make API calls to get recommendations
    Promise.all([
        fetch('/api/jobs/recommendations/skills').then(res => res.json()),
        fetch('/api/jobs/recommendations/preferences').then(res => res.json())
    ])
    .then(([skillsJobs, preferencesJobs]) => {
        displayRecommendations(skillsJobs, skillsContainer);
        displayRecommendations(preferencesJobs, preferencesContainer);
    })
    .catch(error => {
        console.error('Error loading recommendations:', error);
    });
}

// Display recommendations in container
function displayRecommendations(jobs, container) {
    container.innerHTML = jobs.map(job => `
        <div class="job-card">
            <h3>${job.title}</h3>
            <div class="job-meta">
                <span>${job.company}</span>
                <span>${job.matchPercentage}% Match</span>
            </div>
            <div class="job-actions">
                <button onclick="applyForJob('${job._id}')" class="btn primary">Apply Now</button>
                <button onclick="saveJob('${job._id}')" class="btn secondary">Save Job</button>
            </div>
        </div>
    `).join('');
}

// Load past applications
function loadPastApplications() {
    const container = document.getElementById('applications-container');
    const status = document.getElementById('status-filter').value;

    fetch(`/api/applications?status=${status}`)
        .then(response => response.json())
        .then(applications => {
            container.innerHTML = applications.map(app => `
                <div class="application-card">
                    <h3>${app.job.title}</h3>
                    <div class="application-meta">
                        <span>${app.job.company}</span>
                        <span class="status ${app.status.toLowerCase()}">${app.status}</span>
                    </div>
                    <div class="application-timeline">
                        <div class="timeline-item">
                            <span class="date">${new Date(app.appliedDate).toLocaleDateString()}</span>
                            <span class="event">Applied</span>
                        </div>
                        ${app.lastUpdate ? `
                            <div class="timeline-item">
                                <span class="date">${new Date(app.lastUpdate).toLocaleDateString()}</span>
                                <span class="event">${app.lastUpdateText}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `).join('');
        })
        .catch(error => {
            container.innerHTML = '<div class="error">Error loading applications. Please try again.</div>';
        });
}

// Load saved jobs
function loadSavedJobs() {
    const container = document.getElementById('saved-jobs-container');

    fetch('/api/jobs/saved')
        .then(response => response.json())
        .then(jobs => {
            container.innerHTML = jobs.map(job => `
                <div class="job-card">
                    <h3>${job.title}</h3>
                    <div class="job-meta">
                        <span>${job.company}</span>
                        <span>${job.location}</span>
                    </div>
                    <div class="job-actions">
                        <button onclick="applyForJob('${job._id}')" class="btn primary">Apply Now</button>
                        <button onclick="unsaveJob('${job._id}')" class="btn secondary">Remove</button>
                    </div>
                </div>
            `).join('');
        })
        .catch(error => {
            container.innerHTML = '<div class="error">Error loading saved jobs. Please try again.</div>';
        });
}

// Apply for a job
function applyForJob(jobId) {
    fetch('/api/applications', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ jobId })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            alert('Application submitted successfully!');
            loadPastApplications();
        } else {
            alert(result.message || 'Error submitting application. Please try again.');
        }
    })
    .catch(error => {
        alert('Error submitting application. Please try again.');
    });
}

// Save a job
function saveJob(jobId) {
    fetch('/api/jobs/saved', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ jobId })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            alert('Job saved successfully!');
            loadSavedJobs();
        } else {
            alert(result.message || 'Error saving job. Please try again.');
        }
    })
    .catch(error => {
        alert('Error saving job. Please try again.');
    });
}

// Remove a saved job
function unsaveJob(jobId) {
    fetch(`/api/jobs/saved/${jobId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            alert('Job removed from saved jobs!');
            loadSavedJobs();
        } else {
            alert(result.message || 'Error removing job. Please try again.');
        }
    })
    .catch(error => {
        alert('Error removing job. Please try again.');
    });
}

// Filter applications by status
function filterApplications() {
    loadPastApplications();
}

// Handle hash-based navigation
window.addEventListener('hashchange', function() {
    const hash = window.location.hash.slice(1) || 'search-jobs';
    const tabElement = document.querySelector(`[href="#${hash}"]`);
    if (tabElement) {
        switchTab(hash, { currentTarget: tabElement });
    }
}); 