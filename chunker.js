var ChunkedFile = function (file, opts) {
  var getOpts = function (opts, opt_name, defaultValue) {
    return opts && opts[opt_name] ? opts[opt_name] : defaultValue
  };

  var defaultChunkSize = (1024 * 1024 * 5) + 1;
  var me = this;
  me.file = file;
  me.partSize = getOpts(opts, 'chunkSize', defaultChunkSize);
  me.chunks = [];

  var chunkFile = function (file) {
    var totalSize = file.size;
    me.chunkCount = calculateParts(file);
    me.chunkSize = Math.max(Math.ceil(totalSize / 10000), me.partSize );

    for(var i =0; i < me.chunkCount; i++) {
      startPos = (i * me.chunkSize);
      lastPos = startPos + me.chunkSize;
      filePart = file.preferred_slice(startPos, lastPos);

      me.chunks[i] = {
        chunkNumber: i + 1,
        filePart: filePart,
        startPosition: startPos,
        endingPosition: lastPos
      }
    }

    var chunk_sizes = me.chunks.map(function (item) {
      return item.filePart.size;
    });

    afterChunked = chunk_sizes.reduce(function (sum, value) {
      return sum + value;
    });

  };

  var calculateParts = function (file) {
    var size = file.size,
      result = size / me.partSize;
      return Math.ceil(result);
  };

  if ('mozSlice' in this.file) {
    this.file.preferred_slice = this.file.mozSlice;
  } else if ('webkitSlice' in this.file) {
    this.file.preferred_slice = this.file.webkitSlice;
  } else {
    this.file.preferred_slice = this.file.slice;
  }

  chunkFile(file);
};
