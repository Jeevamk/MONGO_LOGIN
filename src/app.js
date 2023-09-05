const express = require('express');
const app = express();
const port = process.env.port || 9000;
const hbs = require('hbs');
const stdCollection = require('../model/model')
const bcrypt = require('bcrypt')
const session = require("express-session")
const auth = require('./auth')
const cookieParser = require("cookie-parser")
const bodyParser = require ("body-parser");
const { body , validationResult } =require ("express-validator");
const parserencoded = bodyParser.urlencoded({ extended: false });



app.set("view engine", 'hbs')
app.set('views')
require('./db/db.js');

app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));





app.get('/', (req, res) => {
    const key = req.cookies.session;
    if (key) {
        res.redirect("/index")

    } else {
        res.render("login");
    }
})

app.post('/studata',parserencoded, [
    body('name')
    .notEmpty().withMessage('Name is required')
    .isLength({min:3}).withMessage("Name must be at least 3 characters"),

    body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail().withMessage('Invalid email format'),

    body('phone')
    .notEmpty().withMessage('phone number is required')
    .isLength({min:10}).withMessage('phone number must be at least 10 characters')
    .matches(/^\d+$/).withMessage('Phone number can only contain digits'),

    body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).*$/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one digit'),

    body('cpassword')
    .notEmpty().withMessage('Confirm Password is required')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords do not match');
      }
      return true;
    })

] , async (req, res) => {
   
        const errors = validationResult(req);
        // console.log(errors);
        
        if(!errors.isEmpty()) {
            const err = errors.array();
            const firsterr = err[0]
           
            return res.render('signup', { errors: firsterr });

        }

    try {
        const password = req.body.password;
        const cpassword = req.body.cpassword;

        if (password === cpassword) {
            const stdData = new stdCollection({
                name: req.body.name,
                email: req.body.email,
                phone: req.body.phone,
                password: req.body.password,
                cpassword: req.body.cpassword
            })

            const postData = await stdData.save();
            res.render("login")

        } else {
            res.render('login', { alert: true })
        }
    }
    catch (err) {
        res.send(err)
    }
})


app.get('/signup', (req, res) => {
    const key = req.cookies.session;
    if (key) {
        res.redirect("/index")
    } else {
        res.render("signup");
    }

})

app.post('/loginpage', async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.loginpassword;

        const userEmail = await stdCollection.findOne({ email: email })
        if(!userEmail) {
            res.render('login', { show: true })  
            return;
        }
        const passMatch = await bcrypt.compare(password, userEmail.password)

        if (passMatch) {
            res.cookie('session', userEmail._id.toString())
            res.redirect('/index');
        } else {
            res.render('login', { alert: true })
        }
    }
    catch (err) {
        res.send(err)

    }
})

app.get('/index', auth, (req, res) => {
    const student = req.student;
    res.render("index", { student: student })
})


app.get('/update', auth, async (req, res) => {
    const student = req.student;
    res.render('update', { student: student });
})

app.post('/update', auth, async (req, res) => {
    try {
        const updateData = {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone

        }
        const updateStudent = await stdCollection.findByIdAndUpdate(
            req.student._id,
            updateData,
            { new: true }
        );

        res.redirect('/index')

    } catch (error) {
        res.send(error)
    }

})


app.get('/delete/:id', auth, async (req, res) => {
    try {
        const studentId = req.params.id;
        await stdCollection.findByIdAndRemove(studentId);
        res.clearCookie('session');
        res.redirect('/');

    }
    catch (error) {
        res.send(error);
    }
})


app.get('/logout', (req, res) => {
    const key = req.cookies.session;
    if (key) {
        res.clearCookie('session');
        res.redirect('/');
    } else {
        res.render('login');
    }
})


app.listen(port, () => {
    console.log("server is running");
})