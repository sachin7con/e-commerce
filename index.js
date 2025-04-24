// SGN , JSPN, JSLN, JSRK, JSSR, JBB, JMD, JKM, JSM, JVM, JSRK, 
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();
const session = require('express-session');
const authRoutes = require('./routes/auth');
const Path = require('path');


const app = express();

mongoose.connect(process.env.MONGO_URI)
.then(res =>{
    console.log('Connected to Mongo db');
})
.catch(err => {
    console.log('Connection Error: ', err);
})


console.log('SESSION_SECRET:', process.env.SESSION_SECRET);


app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true, // ✅ correct casing
}));

app.set('view engine', 'ejs');
app.set('views', Path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/', authRoutes);



app.listen(3000, (req, res) => {
    console.log('listening to port 3000')
});