const express = require('express');
const expressValidator = require('express-validator')
const flash = require('connect-flash');
const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const session = require('express-session');
const handlebars = require('express-handlebars');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const path = require('path')
const Port = process.env.PORT;
const app = express();

const routes = require('./routes/index');
const users = require('./routes/users');

app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', handlebars({defaultLayout:'layout'}));
app.set('view engine', 'handlebars')
app.use( bodyParser.json() );     
app.use(bodyParser.urlencoded({    
  extended: false
})); 
app.use(cookieParser())

app.use(express.static(path.join(__dirname,'public')));

app.use(session({
    secret:'secret',
    saveUninitialised:true,
    resave:true
}));


app.use(passport.initialize());
app.use(passport.session())


 app.use(flash());

 app.use((req, res, next)=>{
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.error = req.flash('error');
    res.locals.user = req.user||null;
    next();
 })

 app.use('/',routes);
 app.use('/users', users);


app.listen(Port || 2010, () => {
    console.log('server is running on port 2010')
})