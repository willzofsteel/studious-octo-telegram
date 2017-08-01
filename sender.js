(function () {
  var Sender = function () {
    this.send = function (url, method, chunk, success, error) {
      var data = new FormData();
      data.append('part', chunk);
      $.ajax({
        url: url,
        data: data,
        contentType: "application/octet-stream",
        cache: false,
        processData: false,
        method: method,
        success: success,
        error: error
      });
    };

    return (this);
  };

  window.Sender = new Sender();
})();
