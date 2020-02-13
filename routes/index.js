const express= require('express');
const router = express.Router();

const ensureAuthenticated =(req,res,next)=>{
    if(req.isAuthenticated()){
        return next();
    }else{
        res.redirect('/users/login')
    }
}
router.get('/dashboard',ensureAuthenticated,(req,res)=>{
    res.render('dashboard')
});

router.get('/',(req,res)=>{
    res.render('home')
})

module.exports = router;