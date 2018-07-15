var express = require("express");
var exphbs = require("express-handlebars");
var request = require("request");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var cheerio = require("cheerio");
var axios = require("axios");
var path = require("path");


var PORT = process.env.PORT || 3000;

// sets instnance of express.js
var app = express();

// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));
// requires all database models
var db = require("./models");

//Mongo configuration for HEROKU
if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI);
} else {
    mongoose.connect("mongodb://localhost/dicedOnions");

}

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));


//route that runs 
app.get("/api/articles", function(req, res){
    //creats scrape request for HTML, pointed at the politics page of the Onion
    axios.get("https://www.theonion.com/c/news-in-brief").then( function(response){
       
        //Loads HTML into cheerio
        var $ = cheerio.load(response.data);

        //empty array to store scraped info
        var results = [];

        // stores selected HTML elements into JSON format
        $(".postlist__item--compact").each(function(i, element){
            var newArticle = {
                title : $(element).find(".headline a").text(),
                release : $(element).find("time a").attr("title"),
                url : $(element).find(".headline a").attr("href"),
                summary : $(element).find(".entry-summary p").text()
            }
            //pushes object into results array
            db.Article.find({title : newArticle.title}, function(err, data){
                if(!data.length){
                results.push(newArticle);
                //stores results array in Article collection
                db.Article.create(newArticle).then(function(data){
                    console.log(data);

                }).catch(function(err){
                    console.log("ERROR HAS OCCURED " +err);
                });
            }

            }).catch(function(err){
                console.log(err);
            });
                
        
        });
        res.json(results);
    });
});

//route finds all in articles collection and orders them by release
app.get("/", function(req, res) {
    db.Article.find({}).sort("-release").then(function(data){
        console.log(data);
        res.render("articles", {articles : data});
    });
  });

// posts new comment and assigns articleId of active article
app.post("/api/comments/:id", function(req, res){
    const newComment = {
        name : req.body.name,
        body : req.body.body,
        articleId : req.params.id,
        time : req.body.time
    }
    db.Comment.create(newComment).then(function(data){
        res.json(data);
    }).catch(function(err){
        console.log(err);
    });
});

// gets all comments that correspond with active article's id
app.get("/api/comments/:id", function(req, res){
    db.Comment.find({
        articleId : req.params.id
    }).then(function(data){
        console.log(data);
        res.json(data);
    }).catch(function(err){
        console.log(err);
    });
});

app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });

