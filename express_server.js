const express = require('express');
const morgan = require('morgan');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const { generateRandomString, getUserByProp, getIndexOfUrl, getMyUrls } = require('./helpers');
const bcrypt = require('bcrypt');
const app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');
app.set('trust proxy', 1);

app.use(methodOverride('_method'));
app.use(morgan('dev'));
app.use(cookieSession({
  name: 'session',
  keys: ['ar0q5%23GHno@l', 'N7fhssla;210**Ty']
}));
app.use(bodyParser.urlencoded({extended: true}));

const users = {

};

// stores all urls created with tinyApp
const urlDatabase = [

];

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/urls", (req, res) => {
  let templateVars;
  // only accessible if user is signed in
  if (users[req.session.userId]) {
    templateVars = users[req.session.userId];
    templateVars.urls = getMyUrls(req.session.userId, urlDatabase);
    res.render("urls_index", templateVars);
    return;
  }
  res.send("You must sign in to access this page.").sendStatus(403);
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
    res.send("Invalid URL, page not found.").sendStatus(404);
    return;
  }
  // check if this url was created by current user
  if (url.userId === req.session.userId) {
    const templateVars = url;
    templateVars.email = users[url.userId].email;
 
    res.render("urls_show", templateVars);
    return;
  }
  res.send("You must sign in to view your urls.").sendStatus(403);
});

// link to longURL
app.get("/u/:shortURL", (req, res) => {
  const url = getIndexOfUrl(req.params.shortURL, urlDatabase);

  if (url) {
    const thisURL = urlDatabase[url];
    const longURL = thisURL.longURL;
    thisURL.totalVisits += 1;
    let visitorKey;
    const time = new Date();
    // check if this person has visited before
    let newVisitor = true;
    for (let visit of thisURL.visits) {
      if (visit.key === req.session.visitor) {
        newVisitor = false;
      }
    }
    // if visitor is new, create new key set cookie, and +1 uniqueClicks
    if (newVisitor) {
      visitorKey = generateRandomString();
      req.session.visitor = visitorKey;
      thisURL.uniqueClicks += 1;
    } else {
      visitorKey = req.session.visitor;
    }
    // add visit to list people who have clicked this link    
    thisURL.visits.push( { key: visitorKey, time: time });
    res.redirect(longURL);
  } else {
    res.send("Inconceivable! Resource may have been deleted by user.").sendStatus(404);
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
    urlDatabase.push({ userId, created, shortURL: newKey, longURL: req.body.longURL, totalVisits: 0, visits: [], uniqueClicks: 0 });
    // Redirect to newly generated url
    res.redirect(`/urls/${newKey}`);
  } else {
    res.send("What are you doing? You can't do that.").sendStatus(400);
  }
});

// sent here by delete buttons on urls_index
app.delete("/urls/:shortURL", (req, res) => {
  const url = getIndexOfUrl(req.params.shortURL, urlDatabase);
  if (urlDatabase[url].userId === req.session.userId) {
    urlDatabase.splice(url, 1);
    res.redirect("/urls");
  } else {
    res.send("Who do you think you are? You can't delete that URL!").sendStatus(400);
  }

});

// edit button on urls_index
app.put("/urls/:shortURL", (req, res) => {
  const url = getIndexOfUrl(req.params.shortURL, urlDatabase);
  if (url && urlDatabase[url].userId === req.session.userId) {
    // if everything checks out, change value in urlDatabase
    const index = getIndexOfUrl(req.params.shortURL, urlDatabase);
    urlDatabase[index].longURL = req.body.longURL;
    res.redirect("/urls");
  } else {
    res.send("You can't modify that URL, it doesn't belong to you!").sendStatus(400);
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
    res.send("Incorrect email or password.").sendStatus(403);
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
    res.send("Invalid email or password.").sendStatus(400);
    return;
  }
  // check if email exists in database
  if (getUserByProp(email, 'email', users)) {
    res.send("That email already exists in our database.").sendStatus(400);
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
