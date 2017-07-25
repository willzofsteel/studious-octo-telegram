$(document).ready(function () {
   var bearer = "Bearer 99905faaa8a64913b9ca162464ca9acd";

  $('#upload-btn').click(uploadFiles);

  function initResumable(targetFunc) {
    var r = new Resumable({
      target: targetFunc,
      maxChunkRetries: 1,
      chunkSize: 5242880,
      forceChunkSize: false,
      uploadMethod: 'PUT',
      testChunks: false,
      prioritizeFirstAndLastChunk: true,
      fileParameterName: 'part',
      headers: {
        "Authorization": bearer
      }
    });

    r.on('fileAdded', function (file, event) { r.upload(); console.log('file-added'); });
    r.on('chunkingComplete', function (file) { console.log('chunking-complete'); });
    r.on('fileSuccess', function (file, message) { console.log('file-success'); });
    r.on('fileError', function (file, message) { console.log('file-error'); });
    return r;
  };

  function uploadFiles() {
    var files = $('#file-input')[0].files;
    for (var i=0; i < files.length; i++) {
      var file = files[i];
      mcsInitiateAssetForUpload(file, function (data) {
        var assetId = data.assetId,
          resumablejs = initResumable(function (params) {
          var hash = convertParamsStringArrayIntoObj(params),
            partnumber = hash.resumableChunkNumber;
            return "https://io.cimediacloud.com/upload/multipart/" + assetId + "/" + partnumber;
        });

        resumablejs.addFile(file);
        resumablejs.on('complete', function (file, message) {
          mcsCompleteMultipartUploadForAsset(assetId, function (data) {
            console.log("uploaded completed for " + assetId);
          });
        });
      });
    };
  };

  function convertParamsStringArrayIntoObj(params) {
    var hash = {};
    params.forEach(function (item) {
      var keyvalue = item.split("="),
        key = keyvalue[0],
        value = keyvalue[1];
      hash[key] = value;
    });

    return hash;
  };

  function mcsInitiateAssetForUpload(file, success) {
    var url = "https://io.cimediacloud.com/upload/multipart"
    return $.ajax({
      url: url,
      dataType: "json",
      headers: {
        "Authorization": bearer
      },
      method: "POST",
      success: success,
      error: function (error) {
        console.log(error);
      },
      data: {
        "name": file.name,
        "size": file.size,
      }
    });
  };

  function mcsCompleteMultipartUploadForAsset(assetId, success) {
    var url = "https://io.cimediacloud.com/upload/multipart/" + assetId + "/complete";
    return $.ajax({
      url: url,
      dataType: "json",
      method: "POST",
      success: success,
      error: function (error) {
        console.log(error);
      },
      headers: {
        "Authorization": bearer
      },
      data: {
        "assetId": assetId
      }
    });
  };
});
