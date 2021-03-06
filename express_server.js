const express = require('express');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');

const helper = require('./helpers');

const app = express();
const salt = bcrypt.genSaltSync(10);
const PORT = 8080; // default port 8080


app.set('view engine', 'ejs');
app.use(cookieSession({
  name: 'session',
  keys: ['ImLookingForwardTotheweekend', 'NogoodmoviesontheScreen']
}));

app.use(bodyParser.urlencoded({ extended: true }));

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = {};

app.get('/', (req, res) => {
  if (req.session['user_id']) {
    res.redirect("/urls");
    return;
  }
  res.redirect('/login');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.get('/hello', (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get('/urls', (req, res) => {
  const id = req.session['user_id'];
  if (id) {
    const email = users[id]['email'];
    const templateVars = {
      email,
      urls: helper.filterDatabaseByID(id, urlDatabase),
    };
    res.render('urls_index', templateVars);
    return;
  }
  res.status(404).send("<h1>Please <a href='/login'>log in<a> first.</h1>");
});


//Add a GET route to show the form
app.get('/urls/new', (req, res) => {
  // Only loggedin users can access this page
  const id = req.session['user_id'];
  if (id) {
    const email = users[id]['email'];
    const templateVars = { email };
    res.render("urls_new", templateVars);
    return;
  }
  res.redirect('/login');
});

// Editing the long url
app.get('/urls/:shortURL', (req, res) => {
  const id = req.session['user_id'];
  if (id) {
    const shortURL = req.params.shortURL;
    if (urlDatabase[shortURL]) {
      const email = users[id]['email'];
      const templateVars = {
        email,
        shortURL,
        longURL: urlDatabase[shortURL]['longURL']
      };
      res.render('urls_show', templateVars);
    } else {
      res.send('<h1>You dont have this short URL. Do you want to <a href="/urls/new">create</a> it?</h1>');
    }
  } else {
    res.status(404).send("<h1>You should <a href='/login'>log in</a> first.</h1>");
  }
});

app.get('/u/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  if (!urlDatabase[shortURL]) {
    res.status(400).send("<h1>Page Not Found!</h1>");
    return;
  }
  const longURL = urlDatabase[shortURL]['longURL'];
  res.redirect(longURL);
});

//Add a GET route to show the registration form
app.get('/register', (req, res) => {
  const id = req.session['user_id'];
  if (id) {
    res.redirect('/urls');
    return;
  }
  const email = null;
  const templateVars = {email};
  res.render("registration", templateVars);
});

//Add a GET route to show the Login form
app.get('/login', (req, res) => {
  const id = req.session['user_id'];
  if (id) {
    res.redirect('/urls');
    return;
  }
  const email = null;
  const templateVars = {email};
  res.render("login", templateVars);
});

app.post('/urls', (req, res) => {
  const id = req.session['user_id'];
  if (id) {
    const longURL = req.body.longURL;
    const shortURL = helper.generateRandomString();
    const userID = id;
    urlDatabase[shortURL] = {longURL, userID};
    // redirect the user to a new page
    res.redirect(302, `/urls/${shortURL}`);
  } else {
    res.status(403).send('Access denied.');
  }
});

app.post('/urls/:shortURL/delete', (req, res) => {
  if (req.session['user_id']) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res.status(403).send('Access denied.');
  }
});

app.post('/urls/:shortURL', (req, res) => {
  if (req.session['user_id']) {
    const shortURL = req.params.shortURL;
    const newLongURL = req.body.newLongURL;
    //update the data base
    urlDatabase[shortURL]['longURL'] = newLongURL;
    res.redirect("/urls");
  } else {
    res.status(403).send('Access denied.');
  }
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = helper.verifyUser(email, password, users, bcrypt);
  if (user) {
    req.session['user_id'] = user['id'];
    res.redirect('/urls');
    return;
  }
  res.status(403).send("<h1>Wrong Eamil or password!</h1>");
});

app.post('/logout', (req, res) => {
  //clear user_id cookie session
  req.session['user_id'] = null;
  res.redirect("/urls");
});

// A registration handler
app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).send("<h1>Please fill in Email and Password fields.</h1>");
    return;
  }
  // check if the email is already registered
  if (helper.getUserByEmail(email, users)) {
    res.status(400).send("<h1>Sorry, this email is already in use.");
    return;
  }
  const id = helper.generateRandomString();
  // put the new user in users object
  users[id] = {
    id,
    email,
    password: bcrypt.hashSync(password, salt)
  };
  req.session['user_id'] = id;
  res.redirect('/urls');

});



app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));