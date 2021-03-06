//jshint esversion:6
require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

//remote connection to mongodb atlas database
mongoose.connect(process.env.CONNECT,{useNewUrlParser: true, useUnifiedTopology: true });
mongoose.set("useCreateIndex", true); //removes warning in terminal

//Database object variables
const memberSchema = new mongoose.Schema ({
    username: String,
    password: String
});

memberSchema.plugin(passportLocalMongoose);

//Database object
const Member = new mongoose.model("Member", memberSchema);

// use static authenticate method of model in LocalStrategy
passport.use(Member.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser(Member.serializeUser());
passport.deserializeUser(Member.deserializeUser());

app.get('/', function (req, res) {
    if (req.isAuthenticated()) {
        const time = new Date();
        let greeting = "";

        if (time.getHours() >= 0 && time.getHours() < 12)
            greeting = "GOOD MORNING.";
        else if (time.getHours() >= 12 && time.getHours() < 5)
            greeting = "GOOD AFTERNOON.";
        else
            greeting = "GOOD EVENING.";

        res.render("home", {greeting: greeting})
    } else {
        res.render("welcome")
    }
});

app.get('/connect', function (req, res) {
    res.render("connect");
});

app.get('/collections', function (req, res) {
    res.render('collections')
});

app.get("/services", function (req, res) {
    if (req.isAuthenticated()) {
        res.render("services");
    } else {
        res.redirect("/signin");
    }
});


app.get('/signup', function (req, res) {
    res.render("signup")
});

app.get('/signin', function (req, res) {
    res.render("signin")
});

app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
});

//Method to accept POST request from signup.ejs
app.post("/signup", function (req, res) {

    Member.register({username: req.body.username}, req.body.password, function (err, Member) {
        if (err) {
            console.log(err);
            res.redirect("/signup");
        } else {
            passport.authenticate('local')(req, res, function () {
                const { MongoClient } = require("mongodb");

// Replace the uri string with your MongoDB deployment's connection string.
                const uri = process.env.CONNECT;

                const client = new MongoClient(uri, {useUnifiedTopology: true});

                async function run() {
                    try {
                        await client.connect();

                        const database = client.db("TUFF");
                        const collection = database.collection("members");

                        // create a filter for a movie to update
                        const filter = { username: req.body.username };

                        // this option instructs the method to create a document if no documents match the filter
                        // const options = { upsert: true };

                        // create a document that sets the plot of the movie
                        const updateDoc = {
                            $set: {
                                name:
                                    req.body.name,
                                email:
                                    req.body.email,
                            },
                        };

                        const result = await collection.updateOne(filter, updateDoc);
                        console.log(
                            `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`,
                        );
                    } finally {
                        await client.close();
                    }
                }
                run().catch(console.dir);


                res.redirect("/");
            });
        }
    });

});

//Method to accept POST request from signin.ejs
app.post('/signin', passport.authenticate('local', { successRedirect: '/',
    failureRedirect: '/signin' }));

app.listen(3000, function () {
    console.log("Server started on port 3000...")
});

