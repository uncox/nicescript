class parser {
  static onload() {
    var $scripts = $('script[type="text/nicescript"]');

    $scripts.each(function () {
      let el = $(this);
      let url = el.attr('src');

      $.ajax(url, {
        dataType: 'text',
        success: function (code) {
          parser.parse_and_run(code);
        }
      });
    });
  }


  static parse_and_run(code) {
    $("head").append($("<script>" + code + "</script>"));
    me.sayHello();
  }
}


$(function () {
  parser.onload();
});
