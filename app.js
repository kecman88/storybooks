const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');

const app = express();
const port = process.env.PORT || 5000;

// Passport config
require('./config/passport')(passport);

// Load routes
const auth = require('./routes/auth');
// Use routes
app.use('/auth', auth);


app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});



app.get('/', (req, res) => {
    res.send('It works');
});