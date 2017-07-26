$(document).ready(function () {
   var bearer = "Bearer 99905faaa8a64913b9ca162464ca9acd";

  $('#mcs-upload-btn').click(mcsUploadFiles);

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

  function mcsUploadFiles() {
    var files = $('#mcs-file-input')[0].files;
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

  //Step 1
  function mcsInitiateAssetForUpload(file, success) {
    var url = "https://io.cimediacloud.com/upload/multipart";
    ajaxPostIt(url, { "name": file.name, "size": file.size }, success);
  };

  //Step 2
  function mcsRetrieveBatchUrls(assetId, numOfChunks, success) {
    var url = "https://io.cimediacloud.com/upload/multipart/" + assetId + "/batch";
    ajaxPostIt(url, { "partNumbers": numOfChunks }, success);
  };

  //Step 3
  //upload to batch urls
  //

  //Step 4
  function mcsCompleteBatchParts(assetId, partsData, success) {
    var url = "https://io.cimediacloud.com/upload/multipart/" + assetId + "/batch/complete";
    ajaxPostIt(url, { "parts": partsData }, success);
  };

  //Step 5
  function mcsCompleteMultipartUploadForAsset(assetId, success) {
    var url = "https://io.cimediacloud.com/upload/multipart/" + assetId + "/complete";
    ajaxPostIt(url, { "assetId": assetId }, success);
  };

  function ajaxPostIt(url, data, success) {
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
      data: data
    });
  };
});
