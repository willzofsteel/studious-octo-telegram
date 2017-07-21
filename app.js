$(document).ready(function () {
  var r = new Resumable({
    target: 'http://localhost:64444',
    maxChunkRetries: 0,
    chunkSize: 5242880,
    forceChunkSize: true,
    uploadMethod: 'PUT'
  });


  //1st mcs endpoint - intiate an asset
  //2nd upload the parts
  //3rd complete the upload
  $('#upload-btn').click(uploadFiles);

  r.assignBrowse(document.getElementById('file-input'));

  r.on('fileAdded', function (file, event) {
    console.log('file-added');
  });

  r.on('chunkingComplete', function (file) {
    console.log('chunking-complete');
  });

  r.on('fileSuccess', function (file, message) {
    console.log('file-success');
  });

  r.on('fileError', function (file, message) {
    console.log('file-error');
  });

  function uploadFiles() {
    r.upload();
  }
});
