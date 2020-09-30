const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');

app.set('view engine', 'ejs');
app.use(cookieParser());

app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {};

//returns a string of 6 random alphanumeric characters
const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 8);
};


app.get('/', (req, res) => {
  res.send("Hello!");
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get('/urls', (req, res) => {
  const user = users[req.cookies['user_id']];
  const templateVars = {
    user,
    urls: urlDatabase,
  };
  res.render('urls_index', templateVars);
});


//Add a GET route to show the form
app.get('/urls/new', (req, res) => {
  const user = users[req.cookies['user_id']];
  const templateVars = {user};
  res.render("urls_new", templateVars);
});

app.get('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const templateVars = {
    shortURL,
    longURL: urlDatabase[shortURL]
  };
  res.render('urls_show', templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    res.status(400).send("Page Not Found!");
    return;
  }
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

//Add a GET route to show the registration form
app.get('/register', (req, res) => {
  res.render("registration");
});

app.post('/urls', (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  // redirect the user to a new page
  res.redirect(302, `/urls/${shortURL}`);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  const newLongURL = req.body.newLongURL;
  //update the data base
  urlDatabase[shortURL] = newLongURL;
  res.redirect(`/urls/${shortURL}`);
});

app.post('/login', (req, res) => {
  const user = req.body.username;
  res.cookie('username', user);
  res.redirect('/urls');
});

app.post('/logout', (req, res) => {
  //clear username cookie
  res.clearCookie('username');
  res.redirect("/urls");
});

// A registration handler
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    res.status(400).send("<h1>Please fill in Email and Password fields.</h1>");
    return;
  }
  const id = generateRandomString();
  // put the new user in users object
  users[id] = {id, email, password};
  res.cookie('user_id', id);
  res.redirect('/urls');

});



app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));