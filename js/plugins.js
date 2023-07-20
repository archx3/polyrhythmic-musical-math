// Avoid `console` errors in browsers that lack a console.
(function() {
  var method;
  var noop = function () {};
  var methods = [
    'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
    'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
    'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
    'timeline', 'timelineEnd', 'timeStamp', 'trace', 'warn'
  ];
  var length = methods.length;
  var console = (window.console = window.console || {});

  while (length--) {
    method = methods[length];

    // Only stub undefined methods.
    if (!console[method]) {
      console[method] = noop;
    }
  }
}());

// Place any jQuery/helper plugins in here.

const numbers = [5, 6, 14, 8, 9, 8]

for (let i = 0, len = numbers.length; i < len; i++) {
  console.log(numbers[i] * 2)
}

numbers.forEach((number) => {
  console.log(number * 2)
})

const name = "Ekuaba Serwaa";

let introduction = "";

introduction = `My name is ${name}.`; // with template literals

introduction += "My name is " + name + "."; // with concatenation

introduction += "My name is "; // with chopped-down concatenation
introduction += name // with chopped-down concatenation
introduction += "."; // with chopped-down concatenation


