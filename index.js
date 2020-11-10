const { argv } = require('yargs');
const path = require('path');
const fs = require('fs');
const CsvToJson = require('./csvtojson');

const { sourceFile, outputFile, delimiter } = argv;

if (!sourceFile) {
  throw new Error('source file not provided');
}

if (!outputFile) {
  throw new Error('output file not provided');
}

const readable = fs
  .createReadStream(path.resolve(__dirname, sourceFile))
  .on('error', (err) => {
    console.log('reading error', err);
  })
  .on('end', () => {
    console.log('done reading');
  });

const writable = fs
  .createWriteStream(path.resolve(__dirname, outputFile))
  .on('error', (err) => {
    console.log('writing error', err);
  })
  .on('finish', () => {
    console.log('done writing');
  });

const csvToJsonTransform = new CsvToJson({ delimiter });

readable.pipe(csvToJsonTransform).pipe(writable);
