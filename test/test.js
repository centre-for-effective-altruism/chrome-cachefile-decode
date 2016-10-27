const expect = require('chai').expect
const lib = require('../index')
const fs = require('fs')
const path = require('path')

const cachefile = fs.readFileSync(path.join(__dirname, 'cachefile.txt'))
const cachefileDecoded = fs.readFileSync(path.join(__dirname, 'cachefile.html')).toString()

describe('Decode', function () {
  it('should decode the input data', function (done) {
    this.timeout(10000)
    lib.decode(cachefile, function (err, result) {
      if (err) throw err
      expect(result).to.have.property('url')
      expect(result).to.have.property('transport')
      expect(result).to.have.property('headers')
      expect(result).to.have.property('body')
      expect(result.body).to.equal(cachefileDecoded)
      done()
    })
  })
})