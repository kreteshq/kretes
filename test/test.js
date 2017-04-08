const chai = require('chai');

chai.should();

describe('Array', () => {
  describe('#indexOf()', () => {
    it('should return -1 when the value is not present', () => {
      [1,2,3].indexOf(4).should.equal(-1)
    });
  });
});

beforeEach(() => {
});
