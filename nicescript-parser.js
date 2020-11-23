class parser {
  static names = {};


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

    setTimeout(function () {
      parser.finalize();
    }, 100);
  }


  static finalize() {
    let skipList = [
      'a', 'abbr', 'acronym', 'address', 'applet', 'area', 'article', 'aside', 'audio', 'base', 'basefont', 'bdo', 'bgsound', 'blink', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'center', 'col', 'colgroup', 'command', 'comment', 'datalist', 'dd', 'del', 'details', 'dir', 'div', 'dl', 'dt', 'embed', 'fieldset', 'figure', 'b', 'big', 'i', 'small', 'tt', 'font', 'footer', 'form', 'frame', 'frameset', 'head', 'header', 'hgroup', 'h1', 'hr', 'html', 'isindex', 'iframe', 'ilayer', 'img', 'input', 'ins', 'keygen', 'keygen', 'label', 'layer', 'legend', 'li', 'link', 'map', 'mark', 'marquee', 'menu', 'meta', 'meter', 'multicol', 'nav', 'nobr', 'noembed', 'noframes', 'noscript', 'object', 'ol', 'optgroup', 'option', 'output', 'p', 'param', 'cite', 'code', 'dfn', 'em', 'kbd', 'samp', 'strong', 'var', 'plaintext', 'pre', 'progress', 'q', 'ruby', 'script', 'section', 'select', 'spacer', 'span', 's', 'strike', 'style', 'sub', 'sup', 'table', 'tbody', 'td', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'u', 'ul', 'video', 'wbr', 'wbr', 'xmp',
    ];

    let root = parser.names['sample'];
    console.log(root);
    $.each(parser.names, function (name, $html) {
      $html.find('*').each(function () {
        let $this = $(this);
        let nodename = $this[0].nodeName.toLowerCase();
        if (skipList.includes(nodename)) {
          return;
        }

        let inst = $('<div>').append(parser.names[nodename].clone()).html();
        $.each(this.attributes, function (i, attrib) {
          var name = attrib.name;
          var value = attrib.value;
          inst = inst.replaceAll('[' + name + ']', value);
        });

        let $inst = $(inst);

        $.each(this.attributes, function (i, attrib) {
          var name = attrib.name;
          var value = attrib.value;
          $inst.attr('prop-' + name, value);
        });

        $this.replaceWith($inst);
      })
    });

    parser.names['sample'].appendTo('body');

    console.log(parser.names['sample'].html());
  }


  static parse_and_run(string) {
    const regex = /(<render.*>.*<\/render>)(.*)/mgs;

    let m;
    let vdom = '';
    let code = '';
    while ((m = regex.exec(string)) !== null) {
      if (m.index === regex.lastIndex) {
        regex.lastIndex++;
      }

      m.forEach((match, groupIndex) => {
        if (groupIndex == 1) {
          vdom = match;
        }

        if (groupIndex == 2) {
          code = match;
        }
      });
    }

    let $render = $(vdom);
    let componentName = $render.attr('name');

    code = "class cls_" + componentName + "{" + code + "}";
    code = code.replace('function ', 'static ');
    $("head").append($("<script>" + code + "</script>"));


    $render.find('*').each(function () {
      let $this = $(this);

      $.each(this.attributes, function (i, attrib) {
        var name = attrib.name;
        var value = attrib.value;
        $this.attr(name, parser.replace_vars(value, componentName));
      });

      $this.text(parser.replace_vars($this.text(), componentName));
    });

    parser.names[componentName] = $render;
  }


  static replace_vars(string, componentName) {
    const regex = /\{(.*?)\}/mgs;
    string = string.replace(regex, function (m0, m1) {
      return '_(cls_' + componentName + '.' + m1 + ')_';
    });

    return string;
  }
}

$(function () {
  parser.onload();
});
