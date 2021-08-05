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
 * @param { *value:string  } value 
 * @param { *property:string }  property 
 * @param { *database: object of objects }  database
 * @returns user object if condition(database[property]) returns true. Otherwise returns false
 */
const getUserByProp = (value, property, database) => {
  for (const user in database) {
    if (database[user][property] === value) {
      return user;
    }
  }
  return false
};

/**
 * Finds url by shortURL property
 * @param {*string } url 
 * @param {*array of objects} urlDatabase 
 * @returns object from urlDatabase if object.shortURL === url. Otherwise returns false.
 */
const getIndexOfUrl = (url, urlDatabase) => {
  for (const u in urlDatabase) {
    if (urlDatabase[u].shortURL === url) {
      return u;
    }
  }
  return false;
};


/**
 * Finds all urls corresponding to given userId
 * @param {*string } userId 
 * @param {*array of objects } urlDatabase 
 * @returns an array populated with all of the url objects created by that user
 */
const getMyUrls = (userId, urlDatabase) => {
  const myList = [];
  urlDatabase.map(url => {
    if (url.userId === userId) {
      myList.push(url);
    }
  }); 
  return myList;
};


module.exports = { generateRandomString, getUserByProp, getIndexOfUrl, getMyUrls };