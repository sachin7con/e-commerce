const Users = require('../models/users.js');
const bcrypt = require('bcryptjs');

const signupPage = (req, res) => {
    res.render('signup', {message: null})
}

const loginPage = (req, res) => {
    res.render('login', {message: null})
}

const signup = async (req, res) => {
    const { name, email, password } = req.body;
    try{
        const existingUser = await Users.findOne({email});
        
        if(existingUser){
            return res.render('signup', {message: 'Email is already registered, Plesae login!'})
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new Users({name, email, password: hashedPassword});
        await newUser.save();
        res.render('signup', {message: 'User registered successfully, please login!'})

    }
    catch(err) {
        console.error('Signup error:', err);
        res.render( 'signup', {message : 'Something went wrong'});
    }
}

const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const existingUser = await Users.findOne({ email });

        if (!existingUser) {
            return res.render('login', { message: "User is not registered, Please signup!" });
        }

        const isPasswordMatch = await bcrypt.compare(password, existingUser.password);

        if (isPasswordMatch) {
            req.session.user = existingUser;
            return res.redirect('/home');
        } else {
            return res.render('login', { message: "Incorrect Password" }); // ✅ corrected here
        }
    } catch (err) {
        console.error('Login error:', err);
        return res.render('login', { message: 'Login error, please try again later' });
    }
};

function isAuthenticated(req, res, next) {
    if(req.session.user){
       return next();
    }
    return res.redirect('/login');
}

module.exports = { signup, signupPage, login, loginPage, isAuthenticated }