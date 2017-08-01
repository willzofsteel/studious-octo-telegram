$(document).ready(function () {
   var bearer = "Bearer d69d8ed44feb40e19f2c631c8c05009c";
   var partSize = (1024 * 1024 * 5) + 1;
   var local = {};

  $('#create-btn').click(createAsset);
  $('#initiate-btn').click(initiateAsset);
  $('#request-btn').click(requestUrls);
  $('#upload-btn').click(uploadParts);
  $('#complete-part-btn').click(completeParts);
  $('#complete-asset').click(completeAsset);
  setText('select a file and Create Asset');

 function createAsset() {
   var files = [].slice.call($('#mcs-file-input')[0].files),
       url = "https://api.cimediacloud.com/assets/create",
       mcs_assets = [];

   local.assets = files.map(function (file, i) {
     mcs_assets[i] = { "name": file.name, "size": file.size };
     return { "name": file.name, "size": file.size, "file": file };
   });

   ajaxPostIt(url, mcs_assets, function (data) {
     local.assets.map(function (item, i) {
       local.assets[i].mcs_id  = data.items[i].id;
     });
     setText('Initiate Asset');
   });
 };

 function initiateAsset() {
   local.assets.forEach(function (asset) {
     var url = "https://io.cimediacloud.com/assets/"+ asset.mcs_id + "/upload/multipart";
     ajaxPostIt(url, {
       uploadMethod: "DirectToCloud",
       partSize: partSize
     },
     function (data) {
       asset.partCount = data.partCount;
       setText('Request upload Urls');
     });
   });
 };

 function requestUrls() {
   local.assets.forEach(function (asset) {
     var url = "https://io.cimediacloud.com/upload/multipart/" + asset.mcs_id + "/batch",
         partNumbers = [];

     for(var i=0; i < asset.partCount; i++) {
       partNumbers[i] = i + 1;
     };

     ajaxPostIt(url, {
       partNumbers: partNumbers
     },function (data) {
       asset.uploadParts = data.parts
       setText('upload parts');
     });
   });
 };

 function uploadParts() {
   local.assets.forEach(function (asset) {
     var chunkedFile = new ChunkedFile(asset.file, {chunkSize: partSize});

     var success = function (data) {
       console.log(data);
     };

     var error = function (error) {
       console.log(error);
     };

     chunkedFile.chunks.forEach(function (chunk, i) {
       var url = asset.uploadParts[i].uploadUrl;
       Sender.send(url, 'POST', chunk.filePart, success, error);
     });

     setText('complete the parts');
   });
 };

 function completeParts() {
   setText('complete the asset');
 };

 function completeAsset() {
 };

 function setText(message) {
   $('#output').text(message);
   setData(local);
 };

 function setData(data) {
   $('#asset-data').val(JSON.stringify(data, null, 2));
 };

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
