const { assert } = require('chai');

const {getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};


describe('getUserByEmail', () => {

  it('shoud return a user with valid email', () => {
    const result = getUserByEmail("user@example.com", testUsers);
    const expected = "userRandomID";
    assert.strictEqual(result, expected);
  });

  it('should return false with an invalid email', () => {
    const result = getUserByEmail("admin@mitra.ca", testUsers);
    assert.strictEqual(result, false);
  });

});