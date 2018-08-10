var express = require('express');
var router = express.Router();
//var db=require("./models");

//require request and cheerio to scrape
var axios= require("axios");
var cheerio = require('cheerio');
var db=require("../models");



// Routes
router.get('/', function(req, res) {
    
    // hbsOject={
    //     messageP: "testing"
    // };   
  

    res.redirect("/articles");

})

router.get('/clearAll', function(req, res) {
  db.Article.remove({},function(err,doc){
    if(err) console.log(err);
    else console.log("remove all articles");

    
  });
  res.redirect("/")
});
   
router.delete('/deleteArticle/id:', function(req, res) {
  console.log("hello delete");
  db.Article.findByIdAndRemove(req.params.id,(err,doc)=>{
    if(err) {
      console.log(err);
      return res.status(500).send(err);
    }
    const response= {
      message: "article successfully deleted",
      id: db.article._id,
    };
    return res.status(200).send(response).redirect("/");
    
  });
  
});

// A GET route for scraping the echoJS website
router.get("/scrape", function(req, res) {
    // First, we grab the body of the html with request
    
    axios.get("https://thehackernews.com/").then(function(response) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(response.data);
      //var titleArr=[]; 
      // Now, we grab every h2 within an article tag, and do the following:
     
    
      $("a.story-link").each(function(i, element) {
        // Save an empty result object
        var result = {};
  
            // Add the text and href of every link, and save them as properties of the result object
            result.title = $(this).find("h2.home-title").text(),  
            result.link = $(this)
            .attr("href");
            result.image=$(this).children("div.clear.home-post-box.cf").children("div.home-img.clear").find("noscript").text().split("src='")[1].split("'")[0];
            result.summary=$(this).find("div.home-desc").text(),
            result.date=$(this).find("div.item-label").text(),
            result.author=$(this).find("div.item-label").children("span").text(),
      
     
        console.log(result);
  
        db.Article.count({title:result.title},function(err,test){
            // if test is 0, the entry is unique , so we can save to the Db
            if(test==0)
            {

                // Create a new Article using the `result` object built from scraping
                db.Article.create(result)
                .then(function(dbArticle) {
                    // View the added result in the console
                    console.log(dbArticle);
                    
                })
                .catch(function(err) {
                    // If an error occurred, send it to the client
                    return res.json(err);
                });
            }
            else
            console.log("article already existed");

        });
   
     
      });
  
      // If we were able to successfully scrape and save an Article, send a message to the client
      //res.send("Scrape Complete");
      res.redirect("/articles");
    });
  });
  
  // Route for getting all Articles from the db
  router.get("/articles", function(req, res) {
    // Grab every document in the Articles collection
    db.Article.find().sort({_id:-1})  //newer articles on top
      .then(function(dbArticle) {
          var hbsArticle= {article : dbArticle};
          res.render('index',hbsArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
     
    });
  });

  router.get("/Savedarticles", function(req, res) {
    // Grab every document in the Articles collection
    db.Article.find().sort({_id:-1})  //newer articles on top
      .then(function(dbArticle) {
          var hbsArticle= {article : dbArticle};
          res.render('savedArticles',hbsArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
     
    });
  });

  router.get("/articles-Json", function(req, res) {
    // Grab every document in the Articles collection
    db.Article.find()  
      .then(function(dbArticle) {
          res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
     
    });
  });
  
  // Route for grabbing a specific Article by id, populate it with it's note
  router.get("/articles/:id", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.findOne({ _id: req.params.id })
      // ..and populate all of the notes associated with it
      .populate("note")
      .then(function(dbArticle) {
        // If we were able to successfully find an Article with the given id, send it back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });







    // Route for grabbing a specific Article by id, populate it with it's note
    router.get("/Saved_article/:id", function(req, res) {
        // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
        db.Article.findByIdAndUpdate({ _id: req.params.id },{'$set': { saved:true}},{new:true}) 
       
          .then(function(dbArticle) {
            // If we were able to successfully find an Article with the given id, send it back to the client
            console.log("save article with id:",req.params.id);
            res.redirect("/");
          })
          .catch(function(err) {
            // If an error occurred, send it to the client
            res.json(err);
          });
      });
  
  // Route for saving/updating an Article's associated Note
  router.post("/articles/:id", function(req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
      .then(function(dbNote) {
        // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
        // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
        // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
        return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
      })
      .then(function(dbArticle) {
        // If we were able to successfully update an Article, send it back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });


  
    




module.exports = router;