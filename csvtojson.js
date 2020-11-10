const { Transform } = require('stream');
const { EOL } = require('os');

class CsvToJson extends Transform {
  constructor(opts = {}) {
    const { delimiter, ...restOpts } = opts;
    super(restOpts);

    this.headers = null;
    this.lastLine = '';
    this.rowsProcessed = 0;

    // if delimiter is passed - set it. otherwise, it will be read from the first row
    this.delimiter = opts.delimiter || null;
  }

  _transform(chunk, _encoding, next) {
    // 1. Split chunk into lines by '/n'
    const rows = chunk.toString().split(EOL);
    // console.log('_transform -> rows', rows);

    rows.forEach((row, index) => {
      // 2. Detect first line of file and save to headers
      if (index === 0) {
        if (!this.headers) {
          // on the very first line we
          // 1. Save the headers
          // 2. Detect separators if needed
          // 3. Push open bracket to file
          this.delimiter = this.delimiter || this.detectSeparator(row);
          this.headers = rows[0].split(`${this.delimiter} `);
          console.log(this.headers);
          this.push('[');
          return;
        }

        // if headers are saved - then not first chunk
        // take last line of previous chunk and attach to first line of current chunk
        const line = `${this.lastLine}${row}`;

        const parsedRow = this.parseCsvRowToObject(line);
        const rowToAdd =
          this.rowsProcessed === 0
            ? JSON.stringify(parsedRow, null, 2)
            : ',' + JSON.stringify(parsedRow, null, 2);

        this.push(rowToAdd);

        this.rowsProcessed++;

        return;
      }

      // 3. Cut last line of chunk and save it to last line and return
      if (index === rows.length - 1) {
        this.lastLine = row;
        return;
      }

      const parsedRow = this.parseCsvRowToObject(row);
      const rowToAdd =
        this.rowsProcessed === 0
          ? JSON.stringify(parsedRow, null, 2)
          : ',' + JSON.stringify(parsedRow, null, 2);

      this.push(rowToAdd);
      this.rowsProcessed++;
    });
    // 4. Attach last line of chunk to first line of next chunk

    next();
  }

  _flush(done) {
    this.push(']');
    done();
  }

  parseCsvRowToObject(row) {
    const rowValues = row.split(this.delimiter);

    const object = this.headers.reduce(
      (obj, header, index) => ({
        ...obj,
        [header]: rowValues[index],
      }),
      {}
    );

    return object;
  }

  detectSeparator(row) {
    // possible separators
    const separators = [',', ';', '|', '\t'];

    // create an array of all separators indexes
    const foundIndexes = separators.map((sep) => row.indexOf(sep));

    // pick lowest positive index number => this will be the first separator met in the row
    // if there are no positive indexes => then leave undefined
    const positiveIndexes = foundIndexes.filter((idx) => idx >= 0);
    const lowest = positiveIndexes.length ? Math.min(...positiveIndexes) : undefined;

    // if lowest is defined => then detect it's index in foundIndexes => pick the separator of the same index
    // return default separator otherwise
    const separator = typeof lowest === 'number' ? separators[foundIndexes.indexOf(lowest)] : ',';

    return separator;
  }
}

module.exports = CsvToJson;
