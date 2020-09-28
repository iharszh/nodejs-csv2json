const fs = require('fs');
const path = require('path');
const { Writable } = require('stream');

class WritableStream extends Writable {
  constructor(outputPath) {
    super();
    this.outputPath = path.resolve(outputPath);
  }

  _write(chunk, encoding, next) {
    fs.appendFile(this.outputPath, `${chunk.toString()}\n`, next);
  }
}

module.exports = WritableStream;
