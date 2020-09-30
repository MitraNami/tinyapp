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


module.exports = {generateRandomString, checkEmail};