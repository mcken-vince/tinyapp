const assert = require('chai').assert;
const { generateRandomString, getUserByProp, getIndexOfUrl, getMyUrls } = require('../helpers');

describe('#generateRandomString', () => {
  it('should generate a string 6 characters long', () => {
    const string = generateRandomString();
    assert.strictEqual(string.length, 6);
    assert.isString(string);
  });
});

describe('#getUserByProp', () => {
  it ("should return correct user when given user's email", () => {
    const property = 'email';
    const value = 'bob@mob.cob';
    const database = {user1:{username: 'joey', email: 'jo@mo.co'}, user2:{username: 'christina', email: 'chris@miss.hiss'}, user3:{username: 'bobster', email: 'bob@mob.cob'}};
    const result = getUserByProp(value, property, database);
    assert.deepEqual(result, 'user3');
  });
  
  it ('should return false if condition is not met for any user', () => {
    const property = 'email';
    const value = 'jim@bim.shmim';
    const database = {user1:{username: 'joey', email: 'jo@mo.co'}, user2:{username: 'christina', email: 'chris@miss.hiss'}, user3:{username: 'bobster', email: 'bob@mob.cob'}};
    const result = getUserByProp(value, property, database);
    assert.isFalse(result);
  });
});

describe('#getIndexOfUrl', () => {
  it ('should return index of url if shortURL property matches', () => {
    const shortURL = 'abc123';
    const urlDatabase = [{userId:'1', shortURL: 'gjr385'}, {userId: '17', shortURL: 'ekv482'}, {userId: '58', shortURL: 'abc123'}, {userId: '1', shortURL: 'env271'}];
    const result = getIndexOfUrl(shortURL, urlDatabase);
    assert.equal(result, 2);
  });
  it ('should return false if url is not in database', () => {
    const shortURL = 'not000';
    const urlDatabase = [{userId:'1', shortURL: 'gjr385'}, {userId: '17', shortURL: 'ekv482'}, {userId: '58', shortURL: 'abc123'}, {userId: '1', shortURL: 'env271'}];
    const result = getIndexOfUrl(shortURL, urlDatabase);
    assert.isFalse(result);
  });
});

describe('#getMyUrls', () => {
  it ('should return a list of urls whose userId property matches the given userId', () => {
    const urlDatabase = [{userId: 'abc', url: 'this is mine'}, {userId: 'gjs', url: 'not mine'}, {userId: 'abc', url: 'also mine'}, {userId:'ald', url: 'also not mine'}];
    const userId = 'abc';
    const result = getMyUrls(userId, urlDatabase);
    assert.deepEqual(result, [{userId: 'abc', url: 'this is mine'}, {userId: 'abc', url: 'also mine'}]);
  });
  it ('should return an empty list if no urls match userId', () => {
    const urlDatabase = [{userId: 'abc', url: 'this is mine'}, {userId: 'gjs', url: 'not mine'}, {userId: 'abc', url: 'also mine'}, {userId:'ald', url: 'also not mine'}];
    const userId = 'xyz';
    const result = getMyUrls(userId, urlDatabase);
    assert.deepEqual(result, []);
  });
});
