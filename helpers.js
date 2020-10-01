//returns a string of 6 random alphanumeric characters
const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 8);
};

// returns the user object for a given email otherwise false
const getUserByEmail = (newEmail, users) => {
  for (let id in users) {
    let user = users[id];
    let email = user['email'];
    if (email === newEmail) {
      return user;
    }
  }
  return false;
};


// returns the user if for the correct email and password, false otherwise
const verifyUser = (email, password, users, bcrypt) => {
  for (let id in users) {
    let user = users[id];
    if (email === user['email']) {
      if (bcrypt.compareSync(password, user['password'])) {
        return user;
      }
    }
  }
  return false;
};


const filterDatabaseByID = (id, db) => {
  return Object.entries(db).reduce((acc, [key, value]) => {
    if (value['userID'] === id) {
      acc[key] = value;
    }
    return acc;
  }, {});
};



module.exports = {
  generateRandomString,
  getUserByEmail,
  verifyUser,
  filterDatabaseByID
};