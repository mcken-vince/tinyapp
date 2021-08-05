const express = require('express');
const morgan = require('morgan');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const { generateRandomString, getUserByProp, getIndexOfUrl, getMyUrls } = require('./helpers');
const bcrypt = require('bcrypt');
const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');
app.set('trust proxy', 1);

app.use(morgan('dev'));
app.use(cookieSession({
  name: 'session',
  keys: ['this-a-key', 'that-a-key']
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
  if (users[req.session.userId]) {
    templateVars = users[req.session.userId];
    templateVars.urls = getMyUrls(req.session.userId, urlDatabase);
    res.render("urls_index", templateVars);
    return;
  }
  res.render("403", { errorMessage: "You must sign in to access this page." });
});

app.get("/urls/new", (req, res) => {
  if (getUserByProp(req.session.userId, 'userId', users)) {
    res.render("urls_new", users[req.session.userId]);
    return;
  }
  res.redirect("/login");
});

app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const url = urlDatabase[getIndexOfUrl(shortURL, urlDatabase)];
  if (!url) {
    res.render("404", { errorMessage: "Invalid URL, page not found."});
    return;
  }
  // check if this url was created by current user
  if (url.userId === req.session.userId) {
    const templateVars = {
      shortURL: url.shortURL,
      longURL: url.longURL,
      email: users[req.session.userId].email,
      userId: req.session.userId,
      created: url.created,
    };
    res.render("urls_show", templateVars);
    return;
  }

  res.render("403", { errorMessage: "You must sign in to view your urls." });
});

// link to longURL
app.get("/u/:shortURL", (req, res) => {
  const url = getIndexOfUrl(req.params.shortURL, urlDatabase);
  if (url) {
    const longURL = urlDatabase[url].longURL;
    res.redirect(longURL);
  } else {
    res.render("404", { errorMessage: "Inconceivable! Resource may have been deleted by user." });
  }
});

// register page
app.get("/register", (req, res) => {
  if (getUserByProp(req.session.userId, 'userId', users)) {
    res.redirect("/urls");
    return;
  }
  // providing userId for compatibility with __header.ejs
  res.render("register", { userId: "" });
});

// login page
app.get("/login", (req, res) => {
  if (getUserByProp(req.session.userId, 'userId', users)) {
    res.redirect("/urls");
    return;
  }
  // reset cookies just in case
  req.session = null;
  // provide userId for compatibility with __header.ejs
  res.render("login", { userId: "" });
});

// create new url submission
app.post("/urls", (req, res) => {
  const newKey = generateRandomString();
  const userId = req.session.userId;
  if (users[userId]) {
    const created = new Date();
    // add new URL to urlDatabase, so that anyone can use the links
    urlDatabase.push({ userId, created, shortURL: newKey, longURL: req.body.longURL});
    // Redirect to newly generated url
    res.redirect(`/urls/${newKey}`);
  } else {
    res.render("400", { errorMessage: "What are you doing? You can't do that." });
  }
});

// sent here by delete buttons on urls_index
app.post("/urls/:shortURL/delete", (req, res) => {
  const url = getIndexOfUrl(req.params.shortURL, urlDatabase);
  if (urlDatabase[url].userId === req.session.userId) {
    urlDatabase.splice(url, 1);
    res.redirect("/urls");
  } else {
    res.render("400", { errorMessage: "Who do you think you are? You can't delete that URL!" });
  }

});

// edit button on urls_index
app.post("/urls/:shortURL", (req, res) => {
  const url = getIndexOfUrl(req.params.shortURL, urlDatabase);
  if (url && urlDatabase[url].userId === req.session.userId) {
    // if everything checks out, change value in urlDatabase
    const index = getIndexOfUrl(req.params.shortURL, urlDatabase);
    urlDatabase[index].longURL = req.body.longURL;
    res.redirect("/urls");
  } else {
    res.render("400", { errorMessage: "You can't modify that URL, it doesn't belong to you!" });
  }
});

// login submission
app.post("/login", (req, res) => {
  const user = users[getUserByProp(req.body.email, 'email', users)];
  // correct passsword and email
  if (user && bcrypt.compareSync(req.body.password, user.password)) {
    req.session.userId = user.userId;
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
  // blank fields in registration form will not be tolerated
  if (!email || !password) {
    res.statusCode = 400;
    res.render("400", { errorMessage: "Invalid email or password" });
    return;
  }
  // check if email exists in database
  if (getUserByProp(email, 'email', users)) {
    res.statusCode = 400;
    res.render("400", { errorMessage: "That email already exists in our database." });
    return;
  }
  // if all is well, create new user
  const userId = generateRandomString();
  users[userId] = { userId, email, password, urls: {} };
  // set cookie and send them on their merry way
  req.session.userId = userId;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
