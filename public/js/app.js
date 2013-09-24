'use strict';

$.scalpel.queue['.autosize'] = function() {
  $(this).autosize();
};

// Load remote markup

$.scalpel.queue[':input[data-load-into][data-url]'] = function() {
  var input = $(this);
  var out = $(input.attr("data-load-into"));
  var t, text = input.val();
  var url = input.attr("data-url");

  function scheduleUpdates() {
    if (text == input.val()) return;
    if (t) clearTimeout(t);
    text = input.val();
    out.addClass("process");
    t = setTimeout(loadUpdates, 500);
  }

  function loadUpdates() {
    $.ajax({
      type: 'post',
      url: url,
      data: { text: input.val() },
      dataType: 'html',
      success: function(data) {
        out.empty().append(data);
        out.removeClass("process");
        if (typeof MathJax != "undefined")
          MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
        $.scalpel.init(out);
      }
    });
  }

  input.unbind(".remoteLoad")
    .bind("keyup.remoteLoad", scheduleUpdates);

  // Bind to DOM element
  input[0].scheduleUpdates = scheduleUpdates;
};

// MathJAX support

if (typeof MathJax == "undefined") {
  $(window).bind("viewportLoad", function() {
    MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
  });
}

// Code highlighting

if (typeof hljs != "undefined")
  $.scalpel.queue['pre.hl'] = function() {
    hljs.highlightBlock(this);
  };