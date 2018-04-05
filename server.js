// Require the Express Module
var express = require('express');
// Create an Express App
var app = express();
// Require body-parser (to receive post data from clients)

var mongoose = require('mongoose');
// This is how we connect to the mongodb database using mongoose -- "message_board" is the name of
//   our db in mongodb -- this should match the name of the db you are going to use for your project.
mongoose.connect('mongodb://localhost/message_board');
// define Schema variable
var Schema = mongoose.Schema;

//Let's go ahead and make our first Schema that we will use to model Messages. 
//All fields check for presence, aka they are required.
var PostSchema = new mongoose.Schema({
    name: {type: String, required: true, minlength: 4}, //user name
    text: {type: String, required: true}, //message
    comments : [{type: Schema.Types.ObjectId, ref:'Comment'}]//array of comment ids.  each element contains a schema object and the comment id.
    },
    {timeStamps: true} //add timestamps
);

//Comments Schema
var CommentSchema = new mongoose.Schema({
    _post:{type: Schema.Types.ObjectId, ref:'Post'},//the comment belongs to a post
    text: {type: String, required: true}//the comment
    },
    {timestamps: true} //add timestamps
)

//set the models
mongoose.model('Post', PostSchema);
mongoose.model('Comment', CommentSchema); 

// store our models in variables
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');

var bodyParser = require('body-parser');
// Integrate body-parser with our App
app.use(bodyParser.urlencoded({ extended: true }));
// Require path
var path = require('path');
// Setting our Static Folder Directory
app.use(express.static(path.join(__dirname, './static')));
// Use native promises
mongoose.Promise = global.Promise;
// Setting our Views Folder Directory
app.set('views', path.join(__dirname, './views'));
// Setting our View Engine set to EJS
app.set('view engine', 'ejs');

// Routes
// Root Request
app.get('/', function(req, res) {
    Post.find({}) //find all the Posts
    .populate('comments') //gather this posts's comments
    .exec(function(err,post){ //add this post's comments ids to the comment array.
        res.render('index', {posts:post}); //render the page with all the posts and comments
    })
})

app.post('/processMessage',function(req,res){
    console.log(req.body);
    //store form elements into post object
    Post.create(req.body) //create post
    .then(post => { //if created, log it and go to index.
        console.log ('post', post);
        res.redirect('/');
    })
    .catch(error => { //no post created, show error.
        console.log('error', error);
    })
})

// Setting our Server to Listen on Port: 8000
app.listen(8000, function() {
    console.log("listening on port 8000");
})