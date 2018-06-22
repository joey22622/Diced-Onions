var express = require("express");
var exphbs = require("express-handlebars");
var request = require("request");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var cheerio = require("cheerio");
var axios = require("axios");
var path = require("path");


var PORT = 3000;

// sets instnance of express.js
var app = express();

// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));
// requires all database models
var db = require("./models");


app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

mongoose.connect("mongodb://localhost/dicedOnions");

// app.get("/", function(req,res){
//     res.sendFile(path.join(__dirname, "/views/dog.handlebars"));
// });

app.get("/api/articles", function(req, res){
    //creats scrape request for HTML, pointed at the politics page of the Onion
    axios.get("https://www.theonion.com/c/news-in-brief").then( function(response){
       
        //Loads HTML into cheerio
        var $ = cheerio.load(response.data);

        //empty array to store scraped info
        var results = [];

        $(".postlist__item--compact").each(function(i, element){
            // var release = Date($(element).find("time").attr("datetime"));


            var newArticle = {
                title : $(element).find(".headline a").text(),
                release : $(element).find("time a").attr("title"),
                url : $(element).find(".headline a").attr("href"),
                summary : $(element).find(".entry-summary p").text()
            }
            results.push(newArticle);
            db.Article.create(newArticle).then(function(data){
                console.log(data);

            }).catch(function(err){
                console.log("ERROR HAS OCCURED " +err);
            });
        });


        res.json(results);
    });
});



app.get("/", function(req, res) {
    db.Article.find({}).sort("-release").then(function(data){
            res.render("articles", data);
    });
    // Handlebars requires an object to be sent to the dog handlebars file.
    // Lucky for us, animals[0] is an object!
  
    // 1. send the dog object from the animals array to the dog handlebars file.
  });

app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });