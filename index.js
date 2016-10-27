const inflate = require('pako').inflate

function decode (input, cb) {
  // coerce an input buffer to a string
  if (input instanceof Buffer) input = input.toString()
  if (!input.length || typeof input !== 'string') return cb(TypeError('function decode() expects a String or Buffer'))
  const fileLines = input.trim().split('\n')

  let fileIdx = -1
  const url = fileLines[0]
  const transport = fileLines[1]
  let headers = {}
  let body = []
  fileLines.slice(2).forEach((line, index) => {
    // check for the first line of each hex file
    if (line.substr(0, 9) === '00000000:') {
      fileIdx += 1
    }
    // add headers
    if (fileIdx === -1) {
      const headerParts = line.split(':')
      headers[headerParts[0].toLowerCase()] = headerParts[1].trim()
    }
    // only get hex-encoded lines
    if (/^[\da-z]{8}:/.test(line)) {
      // the second gzipped section is the response body
      // don't bother putting the first gzipped section, which is just page headers
      if (fileIdx === 1) {
        // get the hex bytes from each line, and parse them into integers
        body.push(line.substr(10, 47).replace(/\s/g, '').match(/.{1,2}/g).map(hex => parseInt(hex, 16)))
      }
    }
  })
  // concat each line of bytes into a single array
  body = body.reduce((prev, curr) => prev.concat(curr), [])

  if (headers['content-encoding'] && headers['content-encoding'].toLowerCase() === 'gzip') {
    // if the response is gzip encoded, inflate it
    try {
      body = inflate(new Uint8Array(body), {to: 'string'})
    } catch (err) {
      return cb(err)
    }
  } else {
    // otherwise, just convert the bytes to a string
    body = body.map(byte => String.fromCharCode(byte)).join('')
  }

  return cb(null, {
    url,
    transport,
    headers,
    body
  })
}

module.exports = {
  decode
}
