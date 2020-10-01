//returns a string of 6 random alphanumeric characters
const generateRandomString = () => {
  return Math.random().toString(36).substring(2, 8);
};

// returns ture if there is a user with the given email
const checkEmail = (newEmail, users) => {
  for (let id in users) {
    let email = users[id]['email'];
    if (email === newEmail) {
      return true;
    }
  }
  return false;
};


// returns the true if the for correct email and pass
const verifyUser = (email, password, users) => {
  for (let id in users) {
    if (email === users[id]['email']) {
      if (password === users[id]['password']) {
        return true;
      }
    }
  }
  return false;
};


// returns the id of the user given their email
const getId = (emailToCheck, users) => {
  for (let id in users) {
    if (emailToCheck === users[id]['email']) {
      return id;
    }
  }
  return null;
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
  checkEmail,
  verifyUser,
  getId,
  filterDatabaseByID
};