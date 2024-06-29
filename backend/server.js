const express = require('express');
const app = express();
require('dotenv').config();
app.use(express.json());
const dbConfig = require('./config/dbConfig');
const port = process.env.PORT || 5000;

const usersRoutes = require('./routes/usersRoutes');
const projectsRoute = require('./routes/projectsRoute');
const tasksRoute = require('./routes/tasksRoute');
const notificationsRoute = require('./routes/notificationsRoute');

app.use('/api/users', usersRoutes);
app.use('/api/projects', projectsRoute);
app.use('/api/tasks', tasksRoute);
app.use('/api/notifications', notificationsRoute);

app.listen(port, () => console.log(`Listening now on port ${port}`));
