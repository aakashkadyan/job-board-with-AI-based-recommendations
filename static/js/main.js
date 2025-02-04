// Check if user is logged in
window.onload = function() {
    const userData = localStorage.getItem('userData');
    if (userData) {
        // User is logged in
        const user = JSON.parse(userData);
        document.getElementById('welcomeUser').textContent = `Welcome, ${user.name}!`;
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('user-section').style.display = 'block';
        document.getElementById('public-content').style.display = 'none';
        document.getElementById('dashboard-content').style.display = 'block';

        // Show relevant tab based on user role
        if (user.role === 'jobseeker') {
            switchTab('jobseeker');
            document.querySelector('.tab[onclick="switchTab(\'employer\')"]').style.display = 'none';
        } else if (user.role === 'employer') {
            switchTab('employer');
            document.querySelector('.tab[onclick="switchTab(\'jobseeker\')"]').style.display = 'none';
        }
    } else {
        // User is not logged in
        document.getElementById('auth-section').style.display = 'block';
        document.getElementById('user-section').style.display = 'none';
        document.getElementById('public-content').style.display = 'block';
        document.getElementById('dashboard-content').style.display = 'none';
    }
};

function switchTab(tabName, event) {
    // Update tab buttons
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    if (event && event.target) {
        event.target.classList.add('active');
    } else {
        document.querySelector(`.tab[onclick*="${tabName}"]`).classList.add('active');
    }

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');
}

function logout() {
    localStorage.removeItem('userData');
    window.location.reload();
} 