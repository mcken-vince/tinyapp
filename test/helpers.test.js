const assert = require('chai').assert;
const { generateRandomString, propSearch, urlSearch, myUrls } = require('../helpers');

describe('#generateRandomString', () => {
  it('should generate a string 6 characters long', () => {
    const string = generateRandomString();
    assert.strictEqual(string.length, 6);
    assert.isString(string);
  });
});

describe('#propSearch', () => {

});

describe('#urlSearch', () => {

});

describe('#myUrls', () => {
  it ('should return a list of urls whose user_id property matches the given user_id', () => {
    const urlDatabase = [{user_id: 'abc', url: 'this is mine'}, {user_id: 'gjs', url: 'not mine'}, {user_id: 'abc', url: 'also mine'}, {user_id:'ald', url: 'also not mine'}];
    const user_id = 'abc';
    const output = myUrls(user_id, urlDatabase);
    assert.deepEqual(output, [{user_id: 'abc', url: 'this is mine'}, {user_id: 'abc', url: 'also mine'}]);
  });
});