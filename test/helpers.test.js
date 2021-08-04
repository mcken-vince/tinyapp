const assert = require('chai').assert;
const { generateRandomString, propSearch, urlSearch } = require('../helpers');

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