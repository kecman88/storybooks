const express = require('express');
const exphbs = require('express-handlebars');
const mongoose = require('mongoose');
const passport = require('passport');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const keys = require('./config/keys');


const port = process.env.PORT || 5000;

// Initialize app
const app = express();

// Load User model
require('./models/User');

// Passport config
require('./config/passport')(passport);

// Session middleware
app.use(cookieParser());
app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: false
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Handlebars middleware
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// Load routes
const auth = require('./routes/auth');
const index = require('./routes/index');

// Set global variables
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
});

// Map global promises
mongoose.Promise = global.Promise;

// Mongoose connect
mongoose.connect(keys.mongoURI)
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));


// Use routes
app.use('/auth', auth);
app.use('/', index);

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});

