const express= require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy
const userData = require('./schema');
const bcrypt = require('bcrypt')

const url= 'mongodb://127.0.0.1:27017/ixxo'
mongoose.connect(url,{useNewUrlParser:true},(err,db)=>{
    if(err){
        console.log(err)
    }else{
        console.log('connected')
    }
})
router.get('/register',(req,res)=>{
    res.render('register')
});
router.get('/login',(req,res)=>{
    res.render('login')
});

router.post('/register',async(req,res)=>{
  try{
    let name = req.body.createUsername;
    let password =await bcrypt.hash(req.body.createPassword,10);

    let alreadyRegistered = await userData.findOne({username:name})
    if(alreadyRegistered){
        console.log('Already Registered')
        return res.render('register')
    }else{
    userData.create({
        username:name,
        password:password
    }).then(()=>{
        console.log('saved')
    })
    res.redirect('login')
    }
    
 }catch{(error)=>{
     console.log(error)
 }}  
 
});

passport.use(new localStrategy((username,password,done)=>{
    
    userData.findOne({username},async (err,user)=>{
        if(err){console.log(error)}
        if(!user){
            return done(null, false,()=>{console.log('Wrong username')})
        }
        if(!(await bcrypt.compare(password,user.password))){
            return done(null, false,()=>{
                console.log('Incorrect Password')
            })
        }
        return done(null,user)
    })

}))


passport.serializeUser((user,done)=>{
    done(null,user.id)
});
passport.deserializeUser((id,done)=>{
    userData.findById(id,(err,user)=>{
        done(err,user)
    })
})

router.post('/login',passport.authenticate('local',{successRedirect:'/',failureRedirect:'/users/login',failureFlash:true}),async(req,res)=>{
res.redirect('/')
})

router.get('/logout',(req,res)=>{
    req.logout();
    res.redirect('/users/login')
})
module.exports = router;