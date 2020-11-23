class parser {
  static names = {};
  static observers = {};

  static skipList = [
    'render', 'a', 'abbr', 'acronym', 'address', 'applet', 'area', 'article', 'aside', 'audio', 'base', 'basefont', 'bdo', 'bgsound', 'blink', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'center', 'col', 'colgroup', 'command', 'comment', 'datalist', 'dd', 'del', 'details', 'dir', 'div', 'dl', 'dt', 'embed', 'fieldset', 'figure', 'b', 'big', 'i', 'small', 'tt', 'font', 'footer', 'form', 'frame', 'frameset', 'head', 'header', 'hgroup', 'h1', 'hr', 'html', 'isindex', 'iframe', 'ilayer', 'img', 'input', 'ins', 'keygen', 'keygen', 'label', 'layer', 'legend', 'li', 'link', 'map', 'mark', 'marquee', 'menu', 'meta', 'meter', 'multicol', 'nav', 'nobr', 'noembed', 'noframes', 'noscript', 'object', 'ol', 'optgroup', 'option', 'output', 'p', 'param', 'cite', 'code', 'dfn', 'em', 'kbd', 'samp', 'strong', 'var', 'plaintext', 'pre', 'progress', 'q', 'ruby', 'script', 'section', 'select', 'spacer', 'span', 's', 'strike', 'style', 'sub', 'sup', 'table', 'tbody', 'td', 'textarea', 'tfoot', 'th', 'thead', 'time', 'title', 'tr', 'u', 'ul', 'video', 'wbr', 'wbr', 'xmp',
  ];


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

    setTimeout(function () {
      data.host = 'sample.com';

      //parser.refill();
    }, 700);
  }


  static finalize() {

    let root = parser.names['sample'];
    $.each(parser.names, function (name, $html) {
      $html.find('*').each(function () {
        let $this = $(this);

        let nodename = $this[0].nodeName.toLowerCase();
        if (parser.skipList.includes(nodename)) {
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

    let index = 0;
    parser.names['sample'].find('*').each(function (name, $html) {
      let $this = $(this);
      $this.attr('uid', ++index);
    });

    parser.names['sample'].clone().appendTo('body');

    parser.fill();
  }


  static fill() {
    $('body').find('*').each(function () {
      let nodename = this.nodeName.toLowerCase();

      if (['script'].includes(nodename)) {
        return;
      }

      let $el = $(this);
      $.each(this.attributes, function (i, attrib) {
        var name = attrib.name;
        var value = attrib.value;

        $el.attr(name, parser.eval_fills(value, name, $el));
      });

      $el.html(parser.eval_fills($el.html(), 'body', $el));
    });
  }


  static refill() {
    $.each(parser.observers, function(uid, observ) {
      let $el = $('[uid=' + uid + ']');
      $.each(observ, function(_, subjects) {
        $.each(subjects, function(attr, subject) {
          let [found, value] = parser.eval_attr(subject);
          if (attr === 'body') {
            $el.html(value);
          } else {
            $el.attr(attr, value);
          }
        });
      });
    });
  }


  static eval_fills(string, attrname, $el) {
    const regex = /_\((.*?)\)_/mgs;
    string = string.replace(regex, function (m0, m1) {
      let uid = $el.attr('uid');
      if (uid === undefined) {
        return eval(m1);
      }

      if (parser.observers[uid] == undefined) {
        parser.observers[uid] = {
          //element: $el,
          observ: {},
        };
      }

      if (parser.observers[uid].observ[attrname] == undefined) {
        parser.observers[uid].observ[attrname] = [];
      }

      if (attrname === 'body') {
        parser.observers[uid].observ[attrname] = $el.html();
      } else {
        parser.observers[uid].observ[attrname] = $el.attr(attrname);
      }
      return eval(m1);
    });

    return string;
  }


  static eval_attr(string) {
    const regex = /_\((.*?)\)_/mgs;
    let found = 0;
    string = string.replace(regex, function (m0, m1) {
      found = 1;
      return eval(m1);
    });

    return [found, string];
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
    code = code.replaceAll('function ', 'static ');
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
      //return eval('cls_' + componentName + '.' + m1 + '');
      return '_(cls_' + componentName + '.' + m1 + ')_';
    });

    return string;
  }
}

$(function () {
  parser.onload();
});
