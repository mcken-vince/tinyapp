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


/**
 * 
 * @param {*string } user_id 
 * @param {*array of objects } urlDatabase 
 * @returns an array populated with all of the url objects created by that user
 */
const myUrls = (user_id, urlDatabase) => {
  const myList = [];
  urlDatabase.map(url => {
    if (url.user_id === user_id) {
      myList.push(url);
    }
  }); 
  return myList;
};

const urlDatabase = [{user_id: 'abc', url: 'this is mine'}, {user_id: 'gjs', url: 'not mine'}, {user_id: 'abc', url: 'also mine'}, {user_id:'ald', url: 'also not mine'}];
const user_id = 'abc';
const output = myUrls(user_id, urlDatabase);
console.log(output);



module.exports = { generateRandomString, propSearch, urlSearch, myUrls };