$(document).ready(function () {
  var r = new Resumable({
    target: 'http://localhost:64444',
    maxChunkRetries: 0,
    chunkSize: 5242880,
    forceChunkSize: true,
    uploadMethod: 'PUT'
  });

  function convertParamsStringArrayIntoObj(params) {
    var hash = {};
    params.forEach(function (item) {
      var keyvalue = item.split("="),
        key = keyvalue[0],
        value = keyvalue[1];
      hash[key] = value;
    });

    return hash;
  }


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

  function mcsInitiateAssetForUpload(fileName, size) {
    //var url = "https://api.cimediacloud.com/upload/multipart";
    var url = "https://io.cimediacloud.com/upload/multipart"
    $.ajax({
      url: url,
      dataType: "json",
      headers: {
        "Authorization": "Bearer 75100e5ffc5d43f98749ad0e8a947a03"
      },
      method: "POST",
      data: {
        "name": fileName,
        "size": size,
      }
    });
  }
});
