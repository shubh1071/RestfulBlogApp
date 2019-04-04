var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var methodOverride = require("method-override"); 
var expressSanitizer = require("express-sanitizer");

//app config
mongoose.connect("mongodb://localhost:27017/restful_blog_app", {useNewUrlParser : true});
app.use(bodyParser.urlencoded({extended : true}));
app.use(expressSanitizer());
app.set("view engine","ejs");
app.use(express.static("public")); 
app.use(methodOverride("_method"));
mongoose.set('useFindAndModify', false);

//Mongoose model config
var blogSchema = new mongoose.Schema({
	title : String,
	image : String,
	body  : String,
	created : {type : Date, default : Date.now}
});

var Blog = mongoose.model("Blog", blogSchema);

// Blog.create({
// 	title : "Test Blog",
// 	image : "https://fsmedia.imgix.net/06/b2/db/40/fd19/465c/bb31/18a3644f340c/hugh-jackman-as-wolverine.jpeg",
// 	body : "This a test blog post"
// });

//Restful routes
app.get("/", function(req,res){
	res.redirect("/blogs");
});

//index route
app.get("/blogs", function(req,res){
	Blog.find({}, function(err,blogs){
		if(err) console.log(err);
		else res.render("index",{blogs : blogs});
	});
});

//new route
app.get("/blogs/new", function(req,res){
	res.render("new");
});

//create route
app.post("/blogs",function(req,res){
	//create blog
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.create(req.body.blog, function(err,newBlog){
		if(err) res.render("new");
		//then redirect to index
		else res.redirect("/blogs");
	});
});

//show route
app.get("/blogs/:id",function(req,res){
	Blog.findById(req.params.id, function(err,foundBlog){
		if(err) res.render("/blogs");
		else res.render("show",{blog : foundBlog});
	});
});

//edit route
app.get("/blogs/:id/edit", function(req,res){
	Blog.findById(req.params.id, function(err, foundBlog){
		if(err) res.render("/blogs");
		else res.render("edit", {blog : foundBlog});
	});
});

//update route
app.put("/blogs/:id", function(req,res){
	req.body.blog.body = req.sanitize(req.body.blog.body);
	Blog.findByIdAndUpdate(req.params.id, req.body.blog,{new : true}, function(err,updatedBlog){
		if(err) res.redirect("/blogs");
		else res.redirect("/blogs/" + req.params.id);
	});
});

//delete route
app.delete("/blogs/:id", function(req,res){
	Blog.findByIdAndRemove(req.params.id,function(err){
		if(err) res.redirect("/blogs");
		else res.redirect("/blogs");
	})
});

app.listen(3000,function(){
	console.log("The RestfulBlogApp server has started");
});