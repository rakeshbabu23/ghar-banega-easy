const router = require('express').Router();
const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middlewares/authMiddleware');

//register a new user
router.post('/register', async (req, res) => {
    try {
        //check if user already exists
        const userExists = await User.findOne({ email: req.body.email });
        if (userExists) {
            throw new Error('User already exists');
        }

        //hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        req.body.password = hashedPassword;

        //save the user
        const newUser = new User(req.body);
        await newUser.save();
        res.send({
            success: true,
            message: 'User registered successfully',
        })

    } catch (error) {
        res.send({
            success: false,
            message: error.message,
        });
    }
});

//login user
router.post('/login', async (req, res) => {
    try {
        //check if user exists
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            throw new Error('User does not exist');
        }

        //check if password is correct
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) {
            throw new Error('Invalid password');
        }

        //create and assign jwt token
        const token = jwt.sign({ userId: user._id }, process.env.TOKEN_SECRET, {
            expiresIn: '1d',
        });
        res.send({
            success: true,
            message: 'User logged in successfully',
            data: token,
        });

    } catch (error) {
        res.send({
            success: false,
            message: error.message,
        });
    }
});

//get logged in User
router.get('/get-user', authMiddleware, async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.body.userId });

        //remove the password from the user object
        user.password = undefined;

        res.send({
            success: true,
            message: 'User fetched successfully',
            data: user,
        });
    } catch (error) {
        res.send({
            success: false,
            message: error.message,
        });
    }
});

module.exports = router;