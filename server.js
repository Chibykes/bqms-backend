const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require('passport');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const session = require('express-session');
const dotenv = require('dotenv');

const port = process.env.PORT || 8080;
const path = require('path');

dotenv.config({ path: './config/config.env' });
require('./config/db-connection')();

app.use(cors({
    origin: ["https://bqms.herokuapp.com"], // allow to server to accept request from different origin
    methods: ["GET","HEAD","PUT","PATCH","POST","DELETE"],
    credentials: true, // allow session cookie from browser to pass through
    exposedHeaders: ['Set-Cookie', 'Date', 'ETag']
})); //for cross-origin-resourses
app.use(express.json({ virtuals: true }));
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: "keyword",
    resave: false,
    saveUninitialized: true,
    cookie: {
//         domain: "https://bqms.herokuapp.com",
//         secure: true,
        expires: 2592000000,
//         sameSite: 'none',
        maxAge: 2592000000
    },
    store: MongoStore.create({ 
        mongoUrl: process.env.MONGO_URI,
        mongooseConn: mongoose.connection 
    })
}));

// =============PASSPORT============ //
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());

// =========== FLASH MESSAGES =========== //
app.use(flash());


app.use('/', require('./api'));

app.listen(port, () => {
    console.log('Server is running on port: 8080');
});

// app.listen(port, '192.168.150.157', () => {
//     console.log('Server is running on port: 8080 v2');
// });
