const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy
const userData = require('./schema');
const bcrypt = require('bcrypt');
const nodemailer =require('nodemailer')

mongoose.connect('mongodb+srv://Chidiebere:1amChidi@cluster0-6dkm7.mongodb.net/testio?retryWrites=true&w=majority',{useNewUrlParser:true}, (err,db)=>{
    if(err){
        console.log(err)
    }else{
        console.log('connected')
    }
})


// const url = 'mongodb://127.0.0.1:27017/testio'
// mongoose.connect(url, {
//     useNewUrlParser: true
// }, (err, db) => {
//     if (err) {
//         console.log(err)
//     } else {
//         console.log('connected')
//     }
// })
router.get('/register', (req, res) => {
    res.render('register')
});
router.get('/login', (req, res) => {
    res.render('login')
});



router.post('/register', async (req, res) => {
    try {
        let firstName = req.body.firstName;
        let lastName = req.body.lastName;
        let phone = req.body.phone;
        let email = req.body.email;
        let password = await bcrypt.hash(req.body.createPassword, 10);

        let alreadyRegistered = await userData.findOne({
            email
        })
        if (alreadyRegistered) {
            console.log('Already Registered')
            let error = 'Already Registered'
            return res.redirect('login',{error})
        } else {
            userData.create({
                firstName,
                lastName,
                email,
                phone,
                password
            }).then(() => {
                console.log('saved')
            })

            const transporter = nodemailer.createTransport({
                service:'Gmail',
                host:'smtp.gmail.com',  
                secure:false,
                auth:{
                    user:'chidistestapp@gmail.com',
                    pass:'mrwawbvuhpapdlgi'
                }
            });
             const mailOption ={
                 from:'chidistestapp@gmail.com',
                 to:email,
                 subject:'Thanks For Signing Up',
                content:'Please feel free to test and give us feed back thanks'
                }
                 transporter.sendMail(mailOption).catch((error)=>{console.log(error)})
            res.redirect('login')
        }

    } catch {
        (error) => {
            console.log(error)
        }
    }

});


router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
}), function (req, res) {
    
})
passport.use(new localStrategy(async function (email, password, done) {
    console.log('route hit')
    userData.findOne({
        email
    }, async function (err, user) {
        if (err) {
            console.log(error)
        }
        if (!user) {
            return done(null, false, {
                msg: "wrong email"
            })
        }
        if (!(await bcrypt.compare(password, user.password))) {
            return done(null, false, {
                msg: 'wrong password'
            })
        }
        return done(null, user)
    })

}))


passport.serializeUser(function (user, done) {
    done(null, user.id)
});
passport.deserializeUser(function (id, done) {
    userData.findById(id, function (err, user) {
        done(err, user)
    })
})



router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/users/login')
})
module.exports = router;