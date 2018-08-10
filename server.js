var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");


// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

//Handlebars
exphbs = require("express-handlebars"),
//View Engine
app.engine("handlebars",exphbs({defaultLayout:"main"}));
app.set("view engine","handlebars");

// Connect to the Mongo DB

var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/hackersNews";
mongoose.Promise= Promise;
mongoose.connect(MONGODB_URI);



// Import routes for controllers
var routes=require("./controller/controller.js");
app.use("/",routes);

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
