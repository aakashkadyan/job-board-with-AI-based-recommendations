// Check authentication and load employer data
window.onload = function() {
    const userData = localStorage.getItem('userData');
    if (!userData) {
        window.location.href = '/login';
        return;
    }

    const user = JSON.parse(userData);
    if (user.role !== 'employer') {
        window.location.href = '/dashboard';
        return;
    }

    document.getElementById('companyName').textContent = user.companyName;
    
    // Load initial data
    loadPostedJobs();
    loadApplications();
    loadAnalytics();
};

// Tab switching functionality
function switchTab(tabName, event) {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    event.currentTarget.classList.add('active');

    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');

    window.location.hash = tabName;
}

// Post a new job
function postJob(event) {
    event.preventDefault();
    
    const jobData = {
        title: document.getElementById('job-title').value,
        type: document.getElementById('job-type').value,
        location: document.getElementById('job-location').value,
        description: document.getElementById('job-description').value,
        requiredSkills: document.getElementById('required-skills').value.split(',').map(skill => skill.trim()),
        salaryRange: {
            min: document.getElementById('salary-min').value,
            max: document.getElementById('salary-max').value
        }
    };

    fetch('/api/jobs', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(jobData)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            alert('Job posted successfully!');
            event.target.reset();
            loadPostedJobs();
        } else {
            alert(result.message || 'Error posting job. Please try again.');
        }
    })
    .catch(error => {
        alert('Error posting job. Please try again.');
    });
}

// Load posted jobs
function loadPostedJobs() {
    const status = document.getElementById('jobs-filter').value;
    const container = document.getElementById('jobs-container');

    fetch(`/api/employer/jobs?status=${status}`)
        .then(response => response.json())
        .then(jobs => {
            container.innerHTML = jobs.map(job => `
                <div class="job-card">
                    <div class="job-card-header">
                        <h3>${job.title}</h3>
                        <span class="status ${job.status}">${job.status}</span>
                    </div>
                    <div class="job-meta">
                        <span>${job.type}</span>
                        <span>${job.location}</span>
                        <span>${job.applications} applications</span>
                    </div>
                    <div class="job-actions">
                        <button onclick="editJob('${job._id}')" class="btn secondary">Edit</button>
                        <button onclick="toggleJobStatus('${job._id}')" class="btn ${job.status === 'active' ? 'warning' : 'success'}">
                            ${job.status === 'active' ? 'Close' : 'Reopen'}
                        </button>
                        <button onclick="deleteJob('${job._id}')" class="btn danger">Delete</button>
                    </div>
                </div>
            `).join('');
        })
        .catch(error => {
            container.innerHTML = '<div class="error">Error loading jobs. Please try again.</div>';
        });
}

// Load applications
function loadApplications() {
    const jobId = document.getElementById('job-filter').value;
    const status = document.getElementById('status-filter').value;
    const container = document.getElementById('applications-container');

    fetch(`/api/employer/applications?jobId=${jobId}&status=${status}`)
        .then(response => response.json())
        .then(applications => {
            container.innerHTML = `
                <table class="applications-table">
                    <thead>
                        <tr>
                            <th>Applicant</th>
                            <th>Job Title</th>
                            <th>Applied Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${applications.map(app => `
                            <tr>
                                <td>
                                    <div class="applicant-info">
                                        <img src="${app.applicant.avatar || '/images/default-avatar.png'}" alt="Avatar">
                                        <div>
                                            <strong>${app.applicant.name}</strong>
                                            <span>${app.applicant.email}</span>
                                        </div>
                                    </div>
                                </td>
                                <td>${app.job.title}</td>
                                <td>${new Date(app.appliedDate).toLocaleDateString()}</td>
                                <td>
                                    <span class="status-badge ${app.status.toLowerCase()}">${app.status}</span>
                                </td>
                                <td>
                                    <div class="application-actions">
                                        <button onclick="viewApplication('${app._id}')" class="btn secondary">View</button>
                                        <select onchange="updateApplicationStatus('${app._id}', this.value)">
                                            <option value="new" ${app.status === 'new' ? 'selected' : ''}>New</option>
                                            <option value="reviewed" ${app.status === 'reviewed' ? 'selected' : ''}>Reviewed</option>
                                            <option value="shortlisted" ${app.status === 'shortlisted' ? 'selected' : ''}>Shortlisted</option>
                                            <option value="interviewed" ${app.status === 'interviewed' ? 'selected' : ''}>Interviewed</option>
                                            <option value="offered" ${app.status === 'offered' ? 'selected' : ''}>Offered</option>
                                            <option value="rejected" ${app.status === 'rejected' ? 'selected' : ''}>Rejected</option>
                                        </select>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `;
        })
        .catch(error => {
            container.innerHTML = '<div class="error">Error loading applications. Please try again.</div>';
        });
}

// Load analytics data
function loadAnalytics() {
    fetch('/api/employer/analytics')
        .then(response => response.json())
        .then(data => {
            document.getElementById('total-applications').textContent = data.totalApplications;
            document.getElementById('active-jobs').textContent = data.activeJobs;
            document.getElementById('conversion-rate').textContent = `${data.conversionRate}%`;

            // Create charts using Chart.js
            createApplicationsChart(data.applicationsByJob);
            createStatusChart(data.applicationsByStatus);
        })
        .catch(error => {
            console.error('Error loading analytics:', error);
        });
}

// Job management functions
function editJob(jobId) {
    fetch(`/api/jobs/${jobId}`)
        .then(response => response.json())
        .then(job => {
            // Populate form with job data
            document.getElementById('job-title').value = job.title;
            document.getElementById('job-type').value = job.type;
            document.getElementById('job-location').value = job.location;
            document.getElementById('job-description').value = job.description;
            document.getElementById('required-skills').value = job.requiredSkills.join(', ');
            document.getElementById('salary-min').value = job.salaryRange.min;
            document.getElementById('salary-max').value = job.salaryRange.max;

            // Switch to post job tab
            switchTab('post-job', { currentTarget: document.querySelector('[href="#post-job"]') });
        })
        .catch(error => {
            alert('Error loading job details. Please try again.');
        });
}

function toggleJobStatus(jobId) {
    fetch(`/api/jobs/${jobId}/toggle-status`, {
        method: 'PUT'
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            loadPostedJobs();
        } else {
            alert(result.message || 'Error updating job status. Please try again.');
        }
    })
    .catch(error => {
        alert('Error updating job status. Please try again.');
    });
}

function deleteJob(jobId) {
    if (confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
        fetch(`/api/jobs/${jobId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(result => {
            if (result.success) {
                loadPostedJobs();
            } else {
                alert(result.message || 'Error deleting job. Please try again.');
            }
        })
        .catch(error => {
            alert('Error deleting job. Please try again.');
        });
    }
}

// Application management functions
function viewApplication(applicationId) {
    window.location.href = `/applications/${applicationId}`;
}

function updateApplicationStatus(applicationId, newStatus) {
    fetch(`/api/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            loadApplications();
        } else {
            alert(result.message || 'Error updating application status. Please try again.');
        }
    })
    .catch(error => {
        alert('Error updating application status. Please try again.');
    });
}

// Filter functions
function filterJobs() {
    loadPostedJobs();
}

function filterApplications() {
    loadApplications();
}

// Handle hash-based navigation
window.addEventListener('hashchange', function() {
    const hash = window.location.hash.slice(1) || 'post-job';
    const tabElement = document.querySelector(`[href="#${hash}"]`);
    if (tabElement) {
        switchTab(hash, { currentTarget: tabElement });
    }
}); 