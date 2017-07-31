$(document).ready(function () {
   var bearer = "Bearer 2828077bae124e96822080444c4df913";
   var debugme = true;
   var partSize = (1024 * 1024 * 5) + 1;

  $('#mcs-upload-btn').click(mcsUploadFiles);

  function initResumable(targetFunc) {
    var r = new Resumable({
      target: targetFunc,
      maxChunkRetries: 0,
      chunkSize: partSize,
      forceChunkSize: true,
      uploadMethod: 'PUT',
      method: 'octet',
      testChunks: false,
      prioritizeFirstAndLastChunk: false,
      fileParameterName: 'part',
    });

    if (debugme) {
      r.on('fileAdded', function (file, event) { r.upload(); console.log('file-added'); });
      r.on('chunkingComplete', function (file) { console.log('chunking-complete'); });
      r.on('fileSuccess', function (file, message) { console.log('file-success'); });
      r.on('fileError', function (file, message) { console.log('file-error'); });
    }

    return r;
  };

  function mcsUploadFiles() {
    var files = $('#mcs-file-input')[0].files;
    for (var i=0; i < files.length; i++) {
      var file = files[i];
      //initiate asset
      mcsInitiateAssetForUpload(file, function (data) {
        var assetId = data.assetId,
            partCount = data.partCount,
            chunkNumbers = [];

        for (var i = 0; i < partCount; i++) {
          chunkNumbers[i] = i + 1;
        };

          mcsRetrieveBatchUrls(assetId, chunkNumbers).done(function (data) {
            var urlByChunk = {},
                parts = data.parts.forEach(function (item) {
              urlByChunk[item.partNumber] = item.uploadUrl;
            });

            var targetFunc = function (params) {
              var hash = convertParamsStringArrayIntoObj(params),
                  chunkNumber = hash.resumableChunkNumber;
              return urlByChunk[chunkNumber];
            };

            var completeBatchFunc = function (file) {
              mcsCompleteBatchParts(assetId, data.parts, function (data) {
                console.log("uploaded completed for " + assetId);
              });
            };

            var r = initResumable(targetFunc);
            r.addFile(file);

            r.on('chunkingComplete', r.upload);

            r.on('error', function (message, file) {
              console.log(message);
            });

            r.on('complete', function () {
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
    ajaxPostIt(url, {
      "name": file.name,
      "size": file.size,
      "partSize": partSize,
      "createManifest": true,
    }, success);
  };

  //Step 2
  function mcsRetrieveBatchUrls(assetId, numOfChunks, success) {
    var url = "https://io.cimediacloud.com/upload/multipart/" + assetId + "/batch";
    return ajaxPostIt(url, { "partNumbers": numOfChunks }, success);
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
      contentType: "application/json",
      dataType: "json",
      method: "POST",
      success: success,
      error: function (error) {
        console.log(error);
      },
      headers: {
        "Authorization": bearer
      },
      data: JSON.stringify(data)
    });
  };
});
