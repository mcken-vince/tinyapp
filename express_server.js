const express = require('express');
const morgan = require('morgan');
const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');

const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
app.use(morgan('dev'), cookieParser(), bodyParser.urlencoded({extended: true}));

// User Format
// "userRandomID": {
//   id: "userRandomID", 
//   email: "user@example.com", 
//   password: "purple-monkey-dinosaur"
//   urls: {"b2xVn2": "http://www.lighthouselabs.ca",
//          "9sm5xK": "http://www.google.com",
// },
// },

const users = {

};

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
  if (users[req.cookies.user_id]) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

/// displays list of all urls
app.get("/urls", (req, res) => {
  console.log(req.cookies.user_id)
  const templateVars = users[req.cookies.user_id];
  console.log("templateVars inside app.get/urls", templateVars);
  res.render("urls_index", templateVars);
});

// page to create new tiny url
app.get("/urls/new", (req, res) => {
  res.render("urls_new", users[req.cookies.user_id]);
});

// direct to page displaying specific shortURL, if it doesn't exist
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: users[req.cookies.user_id].urls[req.params.shortURL], email: users[req.cookies.user_id].email };
  let hasURL = false;
  for (let url in users[req.cookies.user_id].urls) {
    if (url === req.params.shortURL) {
      hasURL = true;
    }
  }

  if (hasURL) {
    res.render("urls_show", templateVars);
  } else {
    res.redirect("/invalid-request");
  }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = users[req.cookies.user_id].urls[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  // const templateVars = { user: userreq.cookies.user_id };
  res.render("register");
});

// redirect here if invalid request
app.get("/invalid-request", (req, res) => {
  // create template to render here
});

app.post("/urls", (req, res) => {
  const newKey = generateRandomString();
  const id = req.cookies.user_id;
  if (users[id]) {
  console.log("id inside post to /urls", users[id]);
  users[id].urls[newKey] = req.body.longURL;
  // Redirect to newly generated key
  res.redirect(`/urls/${newKey}`);
  } else {
    console.log("users[id] is undefined");
  }
});

// sent here by delete buttons on urls_index
app.post("/urls/:shortURL/delete", (req, res) => {
  delete users[req.cookies.user_id].urls[req.params.shortURL];
  res.redirect("/urls");
});

// change longURL for existing shortURL
app.post("/urls/:shortURL", (req, res) => {
  console.log(`${req.params.shortURL} changed to ${req.body.longURL}`)
  users[req.cookies.user_id].urls[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});

// sent here by login button
app.post("/login", (req, res) => {
  res.cookie('user_id', req.body.username);
  
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const id = generateRandomString();
  users[id] = { id: id, email: email, password: password, urls: {} };
  console.log("users[id]", users[id]);
  // set cookie
  res.cookie('user_id', id);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
