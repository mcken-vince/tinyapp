const express = require('express');
const morgan = require('morgan');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const { generateRandomString, getUserByProp, getIndexOfUrl, getMyUrls } = require('./helpers');
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


const users = {

};

// stores all urls created with tinyApp
const urlDatabase = [

];

app.get("/", (req, res) => {
  res.redirect("/urls");
});

/// displays all of the user's created urls
app.get("/urls", (req, res) => {
  let templateVars;
  if (users[req.session.user_id]) {
    templateVars = users[req.session.user_id];
    templateVars.urls = getMyUrls(req.session.user_id, urlDatabase);
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/new", (req, res) => {
  if (getUserByProp(req.session.user_id, 'user_id', users)) {
    res.render("urls_new", users[req.session.user_id]);
    return;
  }
  res.redirect("/login");
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const url = urlDatabase[getIndexOfUrl(shortURL, urlDatabase)];
  console.log("url:", url);
  if (!url) {
    res.render("404", { errorMessage: "Invalid URL, page not found."});
    return;
  }
  // check if this url was created by current user
  if (url.user_id === req.session.user_id) {
    const templateVars = { 
      shortURL: url.shortURL,
      longURL: url.longURL, 
      email: users[req.session.user_id].email, 
      user_id: req.session.user_id,
      created: url.created,
      // add more stretch properties here
    }
    res.render("urls_show", templateVars);
  } else {
    res.render("403", { errorMessage: "You must sign in to view your urls." });
  }
});

app.get("/u/:shortURL", (req, res) => {
  const url = getIndexOfUrl(req.params.shortURL, urlDatabase);
  console.log("url:", url);
  if (url) {
    const longURL = urlDatabase[url].longURL;
    res.redirect(longURL);
  } else {
    res.render("404", { errorMessage: "Sorry, faulty link. Resource may have been deleted by user." });
  }
});

app.get("/register", (req, res) => {
  if (getUserByProp(req.session.user_id, 'user_id', users)) {
    res.redirect("/urls");
    return;
  }
  // provide user_id for compatibility with __header.ejs
  res.render("register", { user_id: "" });
});

app.get("/login", (req, res) => {
  if (getUserByProp(req.session.user_id, 'user_id', users)) {
    res.redirect("/urls");
  }
  // reset cookie just in case
  req.session = null;
  // provide user_id for compatibility with __header.ejs
  res.render("login", { user_id: "" });
});

// create new url submission
app.post("/urls", (req, res) => {
  const newKey = generateRandomString();
  const user_id = req.session.user_id;
  if (users[user_id]) {
  const created = new Date();
  // add new URL to urlDatabase, so that anyone can use the links
  urlDatabase.push({ user_id, created, shortURL: newKey, longURL: req.body.longURL})
  // Redirect to newly generated key
  res.redirect(`/urls/${newKey}`);
  }
});

// sent here by delete buttons on urls_index
app.post("/urls/:shortURL/delete", (req, res) => {
  const url = getIndexOfUrl(req.params.shortURL);
  console.log("deleting this url: ", urlDatabase[url]);
  urlDatabase.splice(url, 1);

  res.redirect("/urls");
});

// edit button on urls_index
app.post("/urls/:shortURL", (req, res) => {
  // change value in user.urls
  users[req.session.user_id].urls[req.params.shortURL] = req.body.longURL;
  
  // change value in urlDatabase
  const index = getIndexOfUrl(req.params.shortURL, urlDatabase);
  urlDatabase[index].longURL = req.body.longURL;
  res.redirect("/urls");
});

// login submission
app.post("/login", (req, res) => {
  const user = users[getUserByProp(req.body.email, 'email', users)];
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

// logout button
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

// register submission
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
  if (getUserByProp(email, 'email', users)) {
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
