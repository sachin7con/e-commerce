const express = require('express');
const router = express.Router();
const { signupPage, signup, loginPage, login, isAuthenticated } = require('../controllers/userController')

const Products = require('../models/product');

router.get('/', (req, res) => {
    if (req.session.user) {
        return res.redirect('/home'); // ✅ prevent double response
    }
    return res.render('index', { message: 'Welcome to the e-commerce app! Please log in or sign up.' });
});


//Fill other routes 

router.get('/add-product', isAuthenticated, (req, res) => {
    res.render('add-product', {message: null});
});

router.post('/add-product', isAuthenticated, async (req, res) => {
    const { title, price, description, imageUrl } = req.body;
    try{
        const newProduct = new Products({
            title, 
            price,
            description,
            imageUrl,
            userId: req.session.user._id
        })
        await newProduct.save();
        res.redirect('/home')
    }
    catch(error) {
        res.render('add-product', {message: 'Error while adding product'})
    }
});


router.get('/signup', signupPage);
router.post('/signup', signup);

router.get('/login', loginPage);
router.post('/login', login);
router.get('/home', isAuthenticated, async (req, res) => {
    try {
        const allProducts = await Products.find({ userId: req.session.user._id }).sort({ createdAt: -1 });
        return res.render('home', {
            message: null,
            user: req.session.user,
            products: allProducts
        });
    } catch (err) {
        console.error('Error loading products:', err);
        return res.render('home', {
            message: 'Error in loading products',
            user: req.session.user,
            products: [] // ✅ fallback to empty array
        });
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Failed to log out');
        }
        res.redirect('/login');
    })
})


module.exports = router;