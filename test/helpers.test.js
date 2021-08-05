const assert = require('chai').assert;
const { generateRandomString, propSearch, getIndexOfUrl, getMyUrls } = require('../helpers');

describe('#generateRandomString', () => {
  it('should generate a string 6 characters long', () => {
    const string = generateRandomString();
    assert.strictEqual(string.length, 6);
    assert.isString(string);
  });
});

describe('#propSearch', () => {
  it ("should return correct user when given user's email", () => {
    const property = 'email';
    const condition = e => e === 'bob@mob.cob';
    const database = {user1:{username: 'joey', email: 'jo@mo.co'}, user2:{username: 'christina', email: 'chris@miss.hiss'}, user3:{username: 'bobster', email: 'bob@mob.cob'}};
    const result = propSearch(property, condition, database);
    assert.deepEqual(result, 'user3');
  });
  
  it ('should return false if condition is not met for any user', () => {
    const property = 'email';
    const condition = e => e === 'jim@bim.shmim';
    const database = {user1:{username: 'joey', email: 'jo@mo.co'}, user2:{username: 'christina', email: 'chris@miss.hiss'}, user3:{username: 'bobster', email: 'bob@mob.cob'}};
    const result = propSearch(property, condition, database);
    assert.isFalse(result);
  });
});

describe('#getIndexOfUrl', () => {
  it ('should return index of url if shortURL property matches', () => {
    const shortURL = 'abc123';
    const urlDatabase = [{user_id:'1', shortURL: 'gjr385'}, {user_id: '17', shortURL: 'ekv482'}, {user_id: '58', shortURL: 'abc123'}, {user_id: '1', shortURL: 'env271'}];
    const result = getIndexOfUrl(shortURL, urlDatabase);
    assert.equal(result, 2);
  });
  it ('should return false if url is not in database', () => {
    const shortURL = 'not000';
    const urlDatabase = [{user_id:'1', shortURL: 'gjr385'}, {user_id: '17', shortURL: 'ekv482'}, {user_id: '58', shortURL: 'abc123'}, {user_id: '1', shortURL: 'env271'}];
    const result = getIndexOfUrl(shortURL, urlDatabase);
    assert.isFalse(result);
  });
});

describe('#getMyUrls', () => {
  it ('should return a list of urls whose user_id property matches the given user_id', () => {
    const urlDatabase = [{user_id: 'abc', url: 'this is mine'}, {user_id: 'gjs', url: 'not mine'}, {user_id: 'abc', url: 'also mine'}, {user_id:'ald', url: 'also not mine'}];
    const user_id = 'abc';
    const result = getMyUrls(user_id, urlDatabase);
    assert.deepEqual(result, [{user_id: 'abc', url: 'this is mine'}, {user_id: 'abc', url: 'also mine'}]);
  });
  it ('should return an empty list if no urls match user_id', () => {
    const urlDatabase = [{user_id: 'abc', url: 'this is mine'}, {user_id: 'gjs', url: 'not mine'}, {user_id: 'abc', url: 'also mine'}, {user_id:'ald', url: 'also not mine'}];
    const user_id = 'xyz';
    const result = getMyUrls(user_id, urlDatabase);
    assert.deepEqual(result, []);
  });
});
