const express = require('express');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');

const helper = require('./helpers');

const app = express();
const PORT = 8080; // default port 8080


app.set('view engine', 'ejs');
app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: true }));

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = {};

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
  const id = req.cookies['user_id'];
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
  const id = req.cookies['user_id'];
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
  const id = req.cookies['user_id'];
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
  const id = req.cookies['user_id'];
  const email = id ? users[id]['email'] : null;
  const templateVars = {email};
  res.render("registration", templateVars);
});

//Add a GET route to show the Login form
app.get('/login', (req, res) => {
  const id = req.cookies['user_id'];
  const email = id ? users[id]['email'] : null;
  const templateVars = {email};
  res.render("login", templateVars);
});

app.post('/urls', (req, res) => {
  if (req.cookies['user_id']) {
    const longURL = req.body.longURL;
    const shortURL = helper.generateRandomString();
    //if I can create a shortURL I'm already logged in
    const userID = req.cookies['user_id'];
    urlDatabase[shortURL] = {longURL, userID};
    // redirect the user to a new page
    res.redirect(302, `/urls/${shortURL}`);
  } else {
    res.status(403).send('Access denied.');
  }
});

app.post('/urls/:shortURL/delete', (req, res) => {
  if (req.cookies['user_id']) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res.status(403).send('Access denied.');
  }
});

app.post('/urls/:shortURL', (req, res) => {
  if (req.cookies['user_id']) {
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
  if (helper.verifyUser(email, password, users)) {
    const id = helper.getId(email, users);
    res.cookie('user_id', id);
    res.redirect('/urls');
    return;
  }
  res.status(403).send("<h1>Wrong Eamil or password!</h1>");
});

app.post('/logout', (req, res) => {
  //clear user_id cookie
  res.clearCookie('user_id');
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
  if (helper.checkEmail(email, users)) {
    res.status(400).send("<h1>Sorry, this email is already in use.");
    return;
  }
  const id = helper.generateRandomString();
  // put the new user in users object
  users[id] = { id, email, password };
  res.redirect('/login');

});



app.listen(PORT, () => console.log(`Example app listening on port ${PORT}!`));