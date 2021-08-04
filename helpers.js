/**
 * 
 * @returns a random alpha-numeric string with a length of 6 characters
 */
const generateRandomString = () => {
  const length = 6;
  let randomString = '';
  const characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  for (let x = 1; x <= length; x++) {
    randomString += characters[Math.floor(Math.random() * characters.length)];
  }
  return randomString;
};


/**
 * 
 * @param { *string property of objects in database }  property 
 * @param { *function that returns true/false } condition 
 * @param { *object of objects }  database
 * @returns user object if condition(database[property]) returns true. Otherwise returns false
 */
const propSearch = (property, condition, database) => {
  for (const user in database) {
    if (condition(database[user][property])) {
      return user;
    }
  }
  return false
};

/**
 * 
 * @param {*string } url 
 * @param {*array of objects} urlDatabase 
 * @returns object from urlDatabase if object.shortURL === url. Otherwise returns false.
 */
const urlSearch = (url, urlDatabase) => {
  for (const u in urlDatabase) {
    if (urlDatabase[u].shortURL === url) {
      return u;
    }
  }
  return false;
};

module.exports = { generateRandomString, propSearch, urlSearch };