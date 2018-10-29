var express = require("express");
// var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");

// Scraping tools
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = 3001;

// Initialize Express
var app = express();

// Configure middleware

// Handlebars
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Use morgan logger for logging requests
// app.use(logger("dev"));

// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Make public a static folder
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/unit18Populater", { useNewUrlParser: true });

// var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/fantasydb";

// mongoose.connect(MONGODB_URI);

// Routes

app.get("/", function (req, res) {
  res.render("index");
});

// A GET route for scraping the  website
app.get("/scrape", function (req, res) {
  console.log("entering get scrape");
  var articleArr = [];
  //Scrape cybercoders for Jobs
  axios.get("https://www.cybercoders.com/search/?searchterms=&searchlocation=27713&newsearch=true&originalsearch=true&sorttype=")
    .then(function (response) {
      // Then, we load that into cheerio and save it to $ for a shorthand selector
      var $ = cheerio.load(response.data);
      // Now, we grab every h3 within an article tag, and do the following:
      $("div.job-details-container").each(function (i, element) {

        // Save an empty result object
        var result = {};

        // Add fields to result object
        result.title = $(this)
          .find("div.job-title")
          .text()
          .trim();

        result.link = $(this)
          .find("a")
          .attr("href");

        result.summary = $(this)
          .find("div.description")
          .text()
          .trim();
        // console.log("the result in scrape")
        // console.log(result);
        articleArr.push(result);
      });

      // add each scrape to document in the collection
      db.Article.create(articleArr)
        .then(function (dbArticle) {
          // View the added result in the console
          // Send JSon of client side
          console.log("you are using the result being sent to client side")
          console.log("87 " + dbArticle);
          res.json(dbArticle);
          // })

        })
        .catch(function (err) {
          // If an error occurred, send it to the client
          console.log("this is the error logic" + err);



        });

    });
})
// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    // .populate  
    .then(function (dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function (req, res) {
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    .populate("notes")
    .then(function (dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// // Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {
//   // Create a new note and pass the req.body to the entry
  db.Note.create(req.body)
    .then(function (dbNote) {
//       // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
//       // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
//       // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return db.Article.findOneAndUpdate({ _id: req.params.id }, { $push: { notes: dbNote._id } }, { new: true });
    })
    .then(function (dbArticle) {
//       // If we were able to successfully update an Article, send it back to the client
      res.json(dbArticle);
    })
    .catch(function (err) {
//       // If an error occurred, send it to the client
      res.json(err);
    });
});

// app.delete("/notes/:id", function (req, res) {

//   db.Note.findByIdAndDelete(req.params.id)
//     .then(function () {
//       res.json({});
//     })
//     .catch(function (err) {
//       // If an error occurred, send it to the client
//       res.json(err);
//     });
// });

// app.delete("/articles/:id", function (req, res) {

//   db.Articles.findByIdAndDelete(req.params.id)
//     .then(function () {
//       res.json({});
//     })
//     .catch(function (err) {
//       // If an error occurred, send it to the client
//       res.json(err);
//     });
// });


// Start the server
app.listen(PORT, function () {
  console.log("App running on port " + PORT + "!");
});
