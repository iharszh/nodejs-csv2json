const { argv } = require('yargs');
const ReadableStream = require('./readStream');
const WritableStream = require('./writeStream');

const readStream = new ReadableStream(argv.sourceFile);
const writeStream = new WritableStream(argv.outputFile);

readStream.pipe(writeStream);
