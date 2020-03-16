const express= require('express');
const router = express.Router();
const axios = require("axios");
const cheerio= require('cheerio');

// const siteUrl = 'https://www.google.co.in/search?q=yoga+gmail+91';

const phoneNo = new RegExp("\\+?\\(?\\d*\\)? ?\\(?\\d+\\)?\\d*([\\s./-]?\\d{2,})+", "g");
const email1 = new RegExp(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\. [a-zA-Z0-9._-]+)/gi)
const email2 = new RegExp(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi)

router.post('/get-contact',async (req,res)=>{
    try {
        let siteUrl = req.body.siteUrl
 const webPage = await axios.get(siteUrl)
 const html = webPage.data;
 let $ = cheerio.load(html);
 const data = $.text().toString();
 const data1 =  data.replace( /[\r\n]+/gm, "" );
 const emails1 = data1.match(email1);
    const emails2 = data1.match(email2);
    let emails ;
    if(emails1 && emails2){
        emails =[...emails1,...emails2]
    }else if(emails2){emails=[...emails2]}
    else if(emails1){emails=[...emails1]}
    else{emails=['No contacts found!!!']}
    const phoneRaw = data.match(phoneNo);

    const phone = Array.from(phoneRaw)

    const number = phone.filter((no)=>{
      return (no.toString())
    })
    const num = number.filter((no)=>{
      return no.length>10
    })
     

    console.log('emails', emails ,'phone', num);
    console.log(emails1,emails2, data1)
    let user = req.user
    res.render('dashboard',{user,emails,num})
    } catch (error) {
        let user = req.user
        res.render('dashboard',{user,error})
    }
 
})



const ensureAuthenticated =(req,res,next)=>{
    if(req.isAuthenticated()){
        return next();
    }else{
        res.redirect('/users/login')
    }
}
router.get('/dashboard',(req,res)=>{
    let user = req.user;

    res.render('dashboard' ,{user})
});

router.get('/',(req,res)=>{
    let user = req.user;

    console.log(user)
    res.render('home',{user})
})

module.exports = router;