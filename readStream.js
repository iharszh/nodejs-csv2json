const { Readable } = require('stream');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

class ReadableStream extends Readable {
  constructor(sourceFile) {
    super();
    this.readStream = fs.createReadStream(path.resolve(sourceFile));
    this.readStreamByLine = readline.createInterface({ input: this.readStream });
  }

  _read() {
    this.readStreamByLine.on('line', (line) => {
      this.push(line);
    });
    // this.readStream.on('data', (chunk) => {
    //   this.push(chunk);
    // });

    // this.readStream.on('end', () => {
    //   console.log('done');
    // });
  }
}

module.exports = ReadableStream;
