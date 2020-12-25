//jshint esversion:6
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');

const app = express();

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get('/', function (req, res) {

    var time = new Date();
    var greeting = "";

    if (time.getHours() >= 0 && time.getHours() < 12)
        greeting = "GOOD MORNING.";
    else if (time.getHours() >= 12 && time.getHours() < 5)
        greeting = "GOOD AFTERNOON.";
    else
        greeting = "GOOD EVENING.";

    res.render("home", {GREETING: greeting});

});

app.get('/connect', function (req, res) {
    res.render("connect");
});

app.get('/collections', function (req, res) {
    res.render("collections");
});

app.get('/services', function (req, res) {
    res.render("services")
});

app.get('/signup', function (req, res) {
    res.render("signup")
});

app.get('/signin', function (req, res) {
    res.render("signin")
});

app.listen(3000, function () {
    console.log("Server started on port 3000...")
})