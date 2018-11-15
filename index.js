var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var things = require('./things.js');
var mongoose = require('mongoose');
var cookieParser = require('cookie-parser');
var session = require('express-session');
mongoose.connect('mongodb://localhost/Testdb');
var upload = multer();
var app = express();

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(upload.array());
app.use(cookieParser());
app.use(session({secret: "Shh, its a secret!"}));

app.use('/static', express.static('public'));
app.set('view engine', 'pug');
app.set('views','./views');

//app.use(express.static('public'));

var personSchema = mongoose.Schema({
   name: String,
   age: Number,
   nationality: String
});
var Person = mongoose.model("Person", personSchema);



// code for handling cookies and sessions------------------------------------------------
// This is for handling basic form submission--------------------------------------------
app.get('/', function(req, res){
   res.cookie('name', 'express'); //Sets name = express
   if(req.session.page_views){
      req.session.page_views++;
      res.send("You visited this page " + req.session.page_views + " times");
   } else {
      req.session.page_views = 1;
      res.send("Welcome to this page for the first time!");
   }
   //res.render('form');
});

app.post('/', function(req, res){
   console.log(req.body);
   res.send("recieved your request!");
});



// This is for handling custom router and middleware using next--------------------------
app.use('/things', function(req, res, next){
   console.log("A request for things received at " + Date.now());
   next();
});

app.get('/things', function(req, res){
    //res.send("Things");
    res.render('first_view', {   
        name: "TutorialsPoint", 
        url:"http://www.tutorialspoint.com"
    });
});



// This is for handling static file------------------------------------------------------
app.get('/static-file-test', function(req, res){
    //res.send("Things");
    res.render('static_file_test', {   
        name: "TutorialsPoint", 
        url:"http://www.tutorialspoint.com"
    });
});



// This is for handling person form-------------------------------------------------------
app.get('/person', function(req, res){
   res.render('person');
});



app.post('/person', function(req, res){
    
   console.log("creatig new person record");
   var personInfo = req.body; //Get the parsed information
   
   if(!personInfo.name || !personInfo.age || !personInfo.nationality){
      res.render('show_message', {
         message: "Sorry, you provided worng info", type: "error"});
   } else {
      var newPerson = new Person({
         name: personInfo.name,
         age: personInfo.age,
         nationality: personInfo.nationality
      });
		
      newPerson.save(function(err, Person){
         if(err)
            res.render('show_message', {message: "Database error", type: "error"});
         else
            res.render('show_message', {
               message: "New person added", type: "success", person: personInfo});
      });
   }
});

var Person = mongoose.model("Person", personSchema);

app.get('/people', function(req, res){
   Person.find(function(err, response){
      res.json(response);
   });
});


// This is for handling common uniform routes----------------------------------------------
app.get('*', function(req, res){
   console.log(req.params);
   res.send("No route matches."); 
});


app.listen(3000);