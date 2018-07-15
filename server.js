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
        console.log(data);
        res.render("articles", {articles : data});
    });
  });

app.post("/api/comments/:id", function(req, res){
    const newComment = {
        name : req.body.name,
        body : req.body.body,
        articleId : req.params.id,
        time : req.body.time
    }
    console.log("=========================")
    console.log(newComment);
    db.Comment.create(newComment).then(function(data){
        res.json(data);
    }).catch(function(err){
        console.log(err);
    });
});

app.get("/api/comments/:id", function(req, res){
    db.Comment.find({
        articleId : req.params.id
    }).then(function(data){
        console.log(data);
        // res.render("articles", {comments : data})
        res.json(data);
    }).catch(function(err){
        console.log(err);
    });
});

app.listen(PORT, function() {
    console.log("App running on port " + PORT + "!");
  });


//   app.get("/", function(req, res){
//     //creats scrape request for HTML, pointed at the politics page of the Onion
//     axios.get("https://www.theonion.com/c/news-in-brief").then( function(response){
       
//         //Loads HTML into cheerio
//         var $ = cheerio.load(response.data);

//         //empty array to store scraped info
//         var results = [];
//         db.Article.find({}).then(function(data){
            
//         $(".postlist__item--compact").each(function(i, element){
//             // var release = Date($(element).find("time").attr("datetime"));



//             var newArticle = {
//                 title : $(element).find(".headline a").text(),
//                 release : $(element).find("time a").attr("title"),
//                 url : $(element).find(".headline a").attr("href"),
//                 summary : $(element).find(".entry-summary p").text()
//             }
//             for(var i = 0; i < data.length; i++){
//                 if(newArticle.title !== data.title){
//                     results.push(newArticle);
//                     db.Article.create(newArticle).then(function(data){
//                         console.log(data);

//                     }).catch(function(err){
//                         console.log("ERROR HAS OCCURED " +err);
//                     });
//                 }
//             }
//         });
//     }).then(function(data){
//         db.Article.find({}).sort("-release").then(function(data){
//             res.render("articles", data);
//         });
//     });

//         res.json(results);
//     });
// })