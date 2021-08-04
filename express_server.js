const express = require('express');
const morgan = require('morgan');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');

// relates to cookie-session
app.set('trust proxy', 1);

app.use(morgan('dev'));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
app.use(bodyParser.urlencoded({extended: true}));

// User Format for reference
// "userRandomID": {
//   user_id: "userRandomID", 
//   email: "user@example.com", 
//   password: "purple-monkey-dinosaur"
//   urls: {"b2xVn2": "http://www.lighthouselabs.ca",
//          "9sm5xK": "http://www.google.com",
//   }
// },

const users = {

};

// stores all urls created by tinyApp
const urlDatabase = [

];

const generateRandomString = () => {
  const length = 6;
  let randomString = '';
  const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  for (let x = 1; x <= length; x++) {
    randomString += characters[Math.floor(Math.random() * characters.length)];
  }
  return randomString;
};

// search through user[property] in users object, return user if condition callback returns true
const propSearch = (property, condition) => {
  for (const user in users) {
    if (condition(users[user][property])) {
      return user;
    }
  }
  return false
};

// return index of url in urlDatabase
const urlSearch = (url) => {
  for (const u in urlDatabase) {
    if (urlDatabase[u].shortURL === url) {
      return u;
    }
  }
  return false;
};


// if user is logged in, redirect to /urls, otherwise redirect to login page
app.get("/", (req, res) => {
  res.redirect("/urls");
});

/// displays list of all urls
app.get("/urls", (req, res) => {
  let templateVars;
  if (users[req.session.user_id]) {
    templateVars = users[req.session.user_id];
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }
});

// page to create new tiny url
app.get("/urls/new", (req, res) => {
  if (propSearch('user_id', i => i === req.session.user_id)) {
    res.render("urls_new", users[req.session.user_id]);
    return;
  }

  res.redirect("/login");
});

// direct to page displaying specific shortURL, if it doesn't exist
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: users[req.session.user_id].urls[req.params.shortURL], 
    email: users[req.session.user_id].email, 
    user_id: req.session.user_id };
  
  let hasURL = false;
  for (let url in users[req.session.user_id].urls) {
    if (url === req.params.shortURL) {
      hasURL = true;
    }
  }

  if (hasURL) {
    res.render("urls_show", templateVars);
  } else {
    res.redirect("/urls");
  }
});

app.get("/u/:shortURL", (req, res) => {
  const url = urlSearch(req.params.shortURL)
  if (url) {
    const longURL = urlDatabase[url].longURL;
    res.redirect(longURL);
  } else {
    res.render("404", { errorMessage: "Sorry, faulty link. Resource may have been deleted by user." });
  }
});

app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
    return;
  }
  // provide user_id for compatibility with __header.ejs
  res.render("register", { user_id: "" });
});

app.get("/login", (req, res) => {
  if (propSearch('user_id', i => i === req.session.user_id)) {
    res.redirect("/urls");
  }
  // reset cookie just in case
  req.session = null;
  // provide user_id for compatibility with __header.ejs
  res.render("login", { user_id: "" });
});

app.post("/urls", (req, res) => {
  const newKey = generateRandomString();
  const user_id = req.session.user_id;
  if (users[user_id]) {
  users[user_id].urls[newKey] = req.body.longURL;

  // add new URL to urlDatabase, so that anyone can use the links
  urlDatabase.push({ user_id, shortURL: newKey, longURL: req.body.longURL })
  // Redirect to newly generated key
  res.redirect(`/urls/${newKey}`);
  }
});

// sent here by delete buttons on urls_index
app.post("/urls/:shortURL/delete", (req, res) => {
  delete users[req.session.user_id].urls[req.params.shortURL];
  const url = urlSearch(req.params.shortURL);
  urlDatabase.splice(url, 1);

  res.redirect("/urls");
});

// edit url
app.post("/urls/:shortURL", (req, res) => {
  console.log(`${req.params.shortURL} changed to ${req.body.longURL}`)
  // change value in user.urls
  users[req.session.user_id].urls[req.params.shortURL] = req.body.longURL;
  
  // change value in urlDatabase
  const index = urlSearch(req.params.shortURL);
  urlDatabase[index].longURL = req.body.longURL;
  res.redirect("/urls");
});

// sent here by login button
app.post("/login", (req, res) => {
  const user = users[propSearch('email', e => e === req.body.email)];
  console.log("user when POST /login: ", user);
  // correct passsword and email
  if (user && bcrypt.compareSync(req.body.password, user.password)) {
    req.session.user_id = user.user_id;
    res.redirect("/urls");
  } else {
    // wrong password or email
    res.render("403", { errorMessage: "Incorrect email or password" });
    return;
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);
  
  // blank fields will not be tolerated
  if (!email || !password) {
    res.statusCode = 400;
    res.render("400", { errorMessage: "Invalid email or password" });
    return;
  } 
  // check if email already exists in database
  if (propSearch('email', (e)=> e === email)) {
    res.statusCode = 400;
    res.render("400", { errorMessage: "That email already exists in our database." });
    return;
  } 
  // if all is well, create new user
  const user_id = generateRandomString();
  users[user_id] = { user_id, email, password, urls: {} };
  console.log("users[user_id]", users[user_id]);
  // set cookie and send them on their merry way
  req.session.user_id = user_id;
  res.redirect("/urls");

});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
