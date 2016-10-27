# Google Chrome Cache File Decoder

A module and CLI script for decoding files from Google Chrome's cache.

## Decode online

`Coming soon... ¯\_(ツ)_/¯`

## Installation

For use as a module:

```sh
npm install -s chrome-cachefile-decode
```

For the CLI

```sh
npm install -g chrome-cachefile-decode
```

## Usage

### Module

```js
const chromeCache = require('chrome-cachefile-decode')
// es6
//import {decode} from 'chrome-cachefile-decode'

const data = "<your cachefile data>"
chromeCache.decode(data, function(err, req) {
    if (err) { 
        console.error(err)
        return
    }
    console.log(req.url)       // the request URL of the resource
    console.log(req.transport) // the transport protocol (e.g. HTTP)
    console.log(req.headers)   // the request headers
    console.log(req.body)      // the request body
})
```

### CLI

You might not need this library — you can get essentially the same result with:

```sh
# copy the body section (second set of hex) of the cache file, then...
pbpaste | xxd -r | gzip -d > outfile.txt
```
(Thanks to contributors [here](http://stackoverflow.com/questions/6133490/how-can-i-read-chrome-cache-files) for the idea)

The advantage of `chrome-cachefile-decode` is that it will split the response body out for you (so you can just `Select All` > `Paste`, instead of needing to find the response body), and will use header info to work out a filename, and to make an intelligent guess about whether or not to decode the response using GZIP.

`chromecachedecode --help`

```sh
Usage: cli STDIN | cachefile [options]

  Options:

    -h, --help               output usage information
    -i, --input <input>      A string copied from a Chrome cache file
    -f, --file <file.txt>    Path to a file containing the Chrome cache file
    -o, --output [filename]  Save file to disk. Filename defaults to resource filename (e.g. `www.example.com`, `index.html`); alternatively specify a filename as the argument. If this argument is not supplied, response will be piped to STDOUT
```

Load data from STDIN (e.g. for OSX — use whatever paste utility your OS supports):
```
pbpaste | chromecachedecode -o
```

Load data from a file:
```
chromecachedecode -o
```

## Accessing cache files

You'll need to visit `chrome://cache` to see your cache files. Find the one you want, select the whole document and copy it (`Ctrl/Cmd + A` `>` `Ctrl/Cmd+C` should do nicely).

The result should look a little something like this:

```
https://www.npmjs.com/
HTTP/1.1 200 OK
cache-control: no-cache
content-type: text/html; charset=utf-8
content-encoding: gzip
<... more headers>
00000000: ac 15 00 00 03 4f 57 00 9e 81 77 b3 5d 9e 2e 00  .....OW...w.]...
00000010: 71 6e 8a b3 5d 9e 2e 00 25 03 00 00 48 54 54 50  qn..]...%...HTTP
00000020: 2f 31 2e 31 20 32 30 30 20 4f 4b 00 43 6f 6e 74  /1.1 200 OK.Cont
<... many more lines of hex for the response-encoded header>
00000000: 1f 8b 08 00 00 00 00 00 00 03 ec bd ed 72 dc 46  .............r.F
00000010: d2 26 fa fb cc 55 e0 95 63 df 9d 89 31 9a a8 ef  .&...U..c...1...
00000020: 82 6c 79 96 a4 28 53 1e cb 63 c9 b6 c6 e3 8d 8d  .ly..(S..c......
<... many more lines of hex for the response body>
```