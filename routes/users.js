const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy
const userData = require('./schema');
const bcrypt = require('bcrypt');
const nodemailer =require('nodemailer');
const async = require('async')
const crypto = require('crypto');

mongoose.connect('mongodb+srv://Chidiebere:1amChidi@cluster0-6dkm7.mongodb.net/testio?retryWrites=true&w=majority',{useNewUrlParser:true}, (err,db)=>{
    if(err){
        console.log(err)
    }else{
        console.log('connected')
    }
})

const ensureAuthenticated =(req,res,next)=>{
    if(req.isAuthenticated()){
        return next();
    }else{
        res.redirect('/users/login')
    }
}
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
    const flashMessages =res.locals.getMessages();
    if(flashMessages.error){
        res.render('login',{
            errors:flashMessages.error
        })
    }else{res.render('login')}
    
});
router.get('/profile',ensureAuthenticated, (req, res) => {
    let user = req.user;
    let phone = `0${req.user.phone}`;
    res.render('profile',{user,phone})
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
            let errors = 'email exists already !!!'
            return res.render('register',{errors})
        } else {


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
                 subject:`Thanks ${firstName} For Signing Up`,
                 text:'Please feel free to test and give us feed back thanks'
                }
                 transporter.sendMail(mailOption).then(()=>{
                    userData.create({
                        firstName,
                        lastName,
                        email,
                        phone,
                        password,
                        resetPasswordToken:undefined,
                        resetPasswordExpires:undefined,
                    })
                 })

               .then(()=>{
                        console.log('saved',`mail sent to ${email}`)
                     })
                

            req.flash('success_msg','Thanks for signing up you can now login')
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
            console.log('not user')
            return done(null, false, {message: "email not found"})
        }
        if (!(await bcrypt.compare(password, user.password))) {
            console.log('wrong Password')
            return done(null, false, {message: 'wrong password'})
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


router.post('/forgot',(req,res,next)=>{
    async.waterfall([
        (done)=>{
            crypto.randomBytes(20,(err,buf)=>{
                let token = buf.toString('hex');
                done(err,token)
            })
        },
        (token,done)=>{
            userData.findOne({email:req.body.email},(err,user)=>{
                if(err){throw err};
                if(!user){
                    req.flash('error','Account does not exist')
                    res.redirect('/forgot')
                };
                user.resetPassordToken = token;
                user.resetPasswordExpires = Date.now + 3600000;

                user.save((err)=>{
                    done(err,token,user)
                })
            })
        },
        (token,user,done)=>{
            const smtpTransport = nodemailer.createTransport({
                service:'Gmail',
                host:'smtp.gmail.com',  
                secure:false,
                auth:{
                    user:'chidistestapp@gmail.com',
                    pass:'mrwawbvuhpapdlgi'
                }
            })
            const mailOption = {
                from:'chidistestapp@gmail.com',
                to:user.email,
                subject:`chidistestapp Password Reset`,
                text:'You (or someone else) have requested to chenge your app password' + '\n\n' +
                     'if it is you, click on the link below or copy to your browser the link expires in one hour'
                     + '\n\n' +
                     'http//'+req.headers.host+'/reset/'+ token 
                };
            smtpTransport.sendMail(mailOption,(err)=>{
                if(err){
                    throw err
                }
                console.log('mail sent');
                req.flash('success-msg', `An e-mail has been sent to ${user.email} with further instructons`);
                done(err,'done')
            })    
       }
        
    ],
    (err)=>{
        if (err) return next(err);
        res.redirect('/forgot');
    });
});


router.get('/reset/:token',(req,res)=>{
    userData.findOne({resetPasswordToken:req.param.token,resetPasswordExpires:{$gt:Date.now()}},(err,user)=>{
        if(err){
         return   console.log(err)
        }
        if(!user){
            console.log('password reset token is invalid or has expired')
          return  res.redirect('/forgot')
        }
        res.render('reset',{token:req.param.token})

    })
});

router.post('/reset/:token',(req,res)=>{
    async.waterfall([
        (done)=>{
            userData.findOne({resetPasswordToken:req.param.token,resetPasswordExpires:{$gt:Date.now()}},(err,user)=>{
                if(err){
                 return   console.log(err)
                }
                if(!user){
                    console.log('password reset token is invalid or has expired')
                  return  res.redirect('/forgot')
                }
                user.setPassword(req.body.password,(err)=>{
                    user.resetPasswordToken = undefined;
                    user.resetPasswordExpires = undefined;
                    user.save()
                })
            })    
        }, (token,user,done)=>{
            const smtpTransport = nodemailer.createTransport({
                service:'Gmail',
                host:'smtp.gmail.com',  
                secure:false,
                auth:{
                    user:'chidistestapp@gmail.com',
                    pass:'mrwawbvuhpapdlgi'
                }
            })
            const mailOption = {
                from:'chidistestapp@gmail.com',
                to:user.email,
                subject:`Password Reset`,
                text:'Your password has been reset succeffully' 
                };
            smtpTransport.sendMail(mailOption,(err)=>{
                if(err){
                    throw err
                }
                console.log('mail sent');
                req.flash('success-msg', `your password has been changed`);
                done(err,'done')
            })    
       },(err)=>{
           return res.redirect('/login')
       }
    ])
})

router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/users/login')
})
module.exports = router;