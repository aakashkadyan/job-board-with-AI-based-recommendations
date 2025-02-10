const express = require("express");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const User = require("./models/User");
const path = require('path');
const { loginRouter, verifyToken } = require("./routes/login");
const signUpRouter = require("./routes/signup");
const jobRoute = require("./routes/jobRoute");
const applicationRoute = require("./routes/applicationRoute");
//const taskRoutes = require("./routes/taskRoutes");

dotenv.config();

// Initialize app
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(express.static('static')); // Serve static files from static directory
app.use('/css', express.static(path.join(__dirname, 'static/css')));
app.use('/js', express.static(path.join(__dirname, 'static/js')));
app.use('/components', express.static(path.join(__dirname, 'static/components')));
app.use(express.urlencoded({ extended: true }));

// Connect to database and start server only after successful connection
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Public routes
    app.get('/', (req, res) => {
      try {
        res.sendFile(path.join(__dirname, 'static', 'index.html'));
      } catch (error) {
        console.error('Error serving index.html:', error);
        res.status(500).send('Internal Server Error');
      }
    });

    app.get('/login', (req, res) => {
      res.sendFile(path.join(__dirname, 'static', 'login.html'));
    });

    app.get('/signup', (req, res) => {
      res.sendFile(path.join(__dirname, 'static', 'signup.html'));
    });

    app.get('/about', (req, res) => {
      res.sendFile(path.join(__dirname, 'static', 'about.html'));
    });

    //Protected routes
    app.get('/jobs', verifyToken, (req, res) => {
      res.sendFile(path.join(__dirname, 'static', 'jobs.html'));
    });

    app.use('/api/jobs', jobRoute);
    app.use('/api/applications', applicationRoute);


    //app.use(verifyToken, jobsRouter);

    app.get('/profile', verifyToken, (req, res) => {
      res.sendFile(path.join(__dirname, 'static', 'profile.html'));
    });

    app.get('/post-job', verifyToken, (req, res) => {
      // Only allow employers to access this route
      if (req.user.role !== 'employer') {
        return res.status(403).json({ error: 'Access denied. Employers only.' });
      }
      res.sendFile(path.join(__dirname, 'static', 'post-job.html'));
    });

    app.get('/candidates', verifyToken, (req, res) => {
      // Only allow employers to access this route
      if (req.user.role !== 'employer') {
        return res.status(403).json({ error: 'Access denied. Employers only.' });
      }
      res.sendFile(path.join(__dirname, 'static', 'candidates.html'));
    });

    // Use routers
    app.use(signUpRouter);
    app.use(loginRouter);

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error('Error:', err.stack);
      res.status(500).send('Something broke!');
    });

    // Handle 404
    app.use((req, res) => {
      console.log('404 - Not Found:', req.url);
      res.status(404).send('Page not found');
    });

    // Start server
    const PORT = process.env.PORT || 5001;

    // Kill any existing process on the port
    const killProcess = () => {
      try {
        require('child_process').execSync(`lsof -ti :${PORT} | xargs kill -9`);
      } catch (error) {
        // Ignore errors if no process was found
      }
    };

    killProcess();

    const server = app.listen(PORT, () => {
      console.log(`Server running on port - http://localhost:${PORT}`);
    }).on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Attempting to kill the process...`);
        killProcess();
        // Try starting the server again
        server.listen(PORT);
      } else {
        console.error('Error starting server:', err);
      }
    });

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
