#!/usr/bin/env node
const cacheDecode = require('./index.js')
const console = require('better-console')
const program = require('commander')
const fs = require('fs')
const path = require('path')


// define CLI input
program
  .arguments('<file>')
  .usage('[options]')
  .usage('STDIN | cachefile [options]')
  .option('-i, --input <input>', 'A string copied from a Chrome cache file')
  .option('-f, --file <file.txt>', 'Path to a file containing the Chrome cache file')
  .option('-o, --output [filename]', 'Save file to disk. Filename defaults to resource filename (e.g. `www.example.com`, `index.html`); alternatively specify a filename as the argument. If this argument is not supplied, response will be piped to STDOUT')
  .action(function(file) {
    console.log('user: %s pass: %s file: %s',
        program.username, program.password, file);
  })
  .parse(process.argv)

// process input
let data = ''
// handle piping from stdin
const stdin = process.openStdin()
stdin.on('data', function(chunk) {
  data += chunk;
})

stdin.on('end', function() {
  if(data.length) {
    processData(data)
    return
  }
  // use the input string
  if (program.input) {
    processData(program.input)
    return
  }
  // use an input file
  if (program.file) {
    processData(fs.readFileSync(path.resolve(program.file)))
    return
  }
  throw new Error ('Did not receive any input data')
})

if (!data.length && program.input) {
  processData(program.input)
}
else if (!data.length)



function processData (data) {
  cacheDecode.decode(data, function(err, result) {
    if (err) {
      console.error(err)
      return
    }
    if (!result.body.length) throw Error ('Response body was not decoded or was empty')
    if (program.output) {
      // save file to disk
      const filename = program.output.length ? program.output : path.join(process.cwd(), path.basename(result.url))
      fs.writeFileSync(path.resolve(filename), result.body)
      return
    }
    process.stdout.write(result.body)
  })
}
