const express = require('express');
const morgan = require('morgan');
const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');

const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
app.use(morgan('dev'), cookieParser(), bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  // "b2xVn2": "http://www.lighthouselabs.ca",
  // "9sm5xK": "http://www.google.com"
};

const generateRandomString = () => {
  const length = 6;
  let randomString = '';
  const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  for (let x = 1; x <= length; x++) {
    randomString += characters[Math.floor(Math.random() * characters.length)];
  }
  return randomString;
};

// if user is logged in, redirect to /urls, otherwise redirect to login page
app.get("/", (req, res) => {
  if (req.cookies.username) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

/// displays list of all urls
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies.username };
  res.render("urls_index", templateVars);
});

// page to create new tiny url
app.get("/urls/new", (req, res) => {
  res.render("urls_new", req.cookies);
});

// direct to page displaying specific shortURL, if it doesn't exist
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies.username };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = { username: req.cookies.username };
  res.render("register", templateVars);
});

// redirect here if invalid request
app.get("/invalid-request", (req, res) => {
  // create template to render here
});

app.post("/urls", (req, res) => {
  // Log the POST request body to the console
  const newKey = generateRandomString();
  urlDatabase[`${newKey}`] = req.body.longURL;
  // Redirect to newly generated key
  res.redirect(`/urls/${newKey}`);
});

// sent here by delete buttons on urls_index
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

// change longURL for existing shortURL
app.post("/urls/:shortURL", (req, res) => {
  console.log(`${urlDatabase[req.params.shortURL]} changed to ${req.body.longURL}`)
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});

// sent here by login button
app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
