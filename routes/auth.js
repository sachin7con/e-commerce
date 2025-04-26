const express = require('express');
const router = express.Router();
const { signupPage, signup, loginPage, login, isAuthenticated } = require('../controllers/userController')
const Order = require('../models/order');

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

//add to cart 
router.post('/add-to-cart', isAuthenticated, async (req, res) => {
    const { productId } = req.body;
    try{
        const product = await Products.findById(productId);
        if(!product){
            return res.redirect('/home');
        }

        req.session.cart = req.session.cart || [];

        const existingProductIndex = req.session.cart.findIndex(Item => Item.productId.toString() === productId);
        if(existingProductIndex !== -1  ){
            req.session.cart[existingProductIndex].quantity += 1;
        } else {
            req.session.cart.push({ productId: product._id, title: product.title, price: product.price, quantity: 1 })
        }

        res.redirect('/home');
    }
    catch (error) {
        console.error('Error adding to cart: ', error);
        response.redirect('/home')
    }
})

//cart page

router.get('/cart', isAuthenticated, async (req, res) => {
       if(!req.session.cart || req.session.cart.length === 0){
        res.render('cart', {
            message: 'Cart is empty',
            cart: []
        })
       }

       const productIds = req.session.cart.map(Item => Item.productId);
       Products.find({ '_id': { $in: productIds }}).then(products => {
        const cartItems = req.session.cart.map(item => {
            const product = products.find(p => p._id.toString() === item.productId.toString());
            return{
                title: product.title,
                price: product.price,
                quantity: product.quantity,
                total: product.price * product.quantity
            }
        })
         res.render('cart', {
            message: null,
            cart: cartItems,
            totalAmount: cartItems.reduce((total, item) => total + item.total, 0)
         });

       }).catch(err => {
        console.error('Error fetching cart items:', err);
        res.redirect('/cart');
    });

})

//checkout
router.get('/checkout', isAuthenticated,  async(req, res) => {
    if(!req.session.cart || req.session.cart.length === 0){
        return res.redirect('/cart')
    }

    //order details

    const totalAmount = req.session.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    res.render('checkout', {
        message: null,
        cartItems: req.session.cart,
        totalAmount
    });
})


router.post('/checkout', isAuthenticated, async (req, res) => {
    const orderData = {
        userId: req.session.user._id,
        items: req.session.cart,
        totalAmount: req.session.cart.reduce((total, item) => total + item.price * item.quantity, 0),
        status: 'pending'
    };
    try{
        const newOrder = new Order(orderData);
        await newOrder.save();

        req.session.cart = [];

        res.redirect('/orders');

    } catch (error ) {
        console.error('Error placing order:', error);
        res.redirect('/checkout')
    }
});

router.get('/orders', isAuthenticated, async(req, res) => {
    try{
        const orders = Order.find({ userId: req.session.user._id })

        res.render('orders', { orders })
    } catch (err) {
        console.error('Error fetching orders:', err);
        res.redirect('/home');
    }
})
  

router.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).send('Failed to log out');
        }
        res.redirect('/login');
    })
})


module.exports = router;