(function () {
  var Sender = function () {
    this.send = function (url, method, chunk, success, error) {
      $.ajax({
        url: url,
        contentType: false,
        data: chunk,
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
