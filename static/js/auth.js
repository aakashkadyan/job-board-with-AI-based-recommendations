// Check if user is already logged in
window.onload = function() {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('userData');
    if (token && userData) {
        window.location.href = '/';
    }
};

// Handle login form submission
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();
        
        if (response.ok) {
            // Store token and user data
            localStorage.setItem('token', data.token);
            localStorage.setItem('userData', JSON.stringify(data.user));
            
            // Set token for future requests
            setAuthToken(data.token);
            
            alert('Login successful!');
            window.location.href = '/';
        } else {
            alert('Error: ' + data.error);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during login');
    }
});

// Function to set auth token in headers
function setAuthToken(token) {
    if (token) {
        // Apply to every request
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        // Delete auth header
        delete axios.defaults.headers.common['Authorization'];
    }
}

// Function to check if token is expired
function isTokenExpired(token) {
    if (!token) return true;
    
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp < Date.now() / 1000;
    } catch (error) {
        return true;
    }
}

// Function to handle logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setAuthToken(null);
    window.location.href = '/login';
} 