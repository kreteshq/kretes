// Generated automatically by nearley, version 2.19.0
// http://github.com/Hardmath123/nearley
(function () {
  function id(x) { return x[0]; }
  var grammar = {
    Lexer: undefined,
    ParserRules: [
      { "name": "main$string$1", "symbols": [{ "literal": "i" }, { "literal": "m" }, { "literal": "p" }, { "literal": "o" }, { "literal": "r" }, { "literal": "t" }], "postprocess": function joiner(d) { return d.join(''); } },
      { "name": "main$ebnf$1", "symbols": [] },
      { "name": "main$ebnf$1", "symbols": ["main$ebnf$1", /./], "postprocess": function arrpush(d) { return d[0].concat([d[1]]); } },
      { "name": "main", "symbols": ["_", "main$string$1", "__", "main$ebnf$1", "declaration"], "postprocess": (data) => data[4] },
      { "name": "declaration$string$1", "symbols": [{ "literal": "e" }, { "literal": "x" }, { "literal": "p" }, { "literal": "o" }, { "literal": "r" }, { "literal": "t" }, { "literal": " " }, { "literal": "d" }, { "literal": "e" }, { "literal": "f" }, { "literal": "a" }, { "literal": "u" }, { "literal": "l" }, { "literal": "t" }], "postprocess": function joiner(d) { return d.join(''); } },
      { "name": "declaration", "symbols": ["_", "declaration$string$1", "interface"], "postprocess": (data) => data[2] },
      { "name": "declaration$string$2", "symbols": [{ "literal": "e" }, { "literal": "x" }, { "literal": "p" }, { "literal": "o" }, { "literal": "r" }, { "literal": "t" }], "postprocess": function joiner(d) { return d.join(''); } },
      { "name": "declaration", "symbols": ["_", "declaration$string$2", "interface"] },
      { "name": "declaration", "symbols": ["interface"] },
      { "name": "interface$string$1", "symbols": [{ "literal": "i" }, { "literal": "n" }, { "literal": "t" }, { "literal": "e" }, { "literal": "r" }, { "literal": "f" }, { "literal": "a" }, { "literal": "c" }, { "literal": "e" }], "postprocess": function joiner(d) { return d.join(''); } },
      { "name": "interface$ebnf$1", "symbols": [] },
      { "name": "interface$ebnf$1$subexpression$1", "symbols": ["Method"] },
      { "name": "interface$ebnf$1", "symbols": ["interface$ebnf$1", "interface$ebnf$1$subexpression$1"], "postprocess": function arrpush(d) { return d[0].concat([d[1]]); } },
      {
        "name": "interface", "symbols": ["_", "interface$string$1", "__", "name", "_", { "literal": "{" }, "interface$ebnf$1", "_", { "literal": "}" }, "_"], "postprocess":
          (data) => {
            return {
              [data[3]]: data[6].flat().reduce((stored, current) => Object.assign(stored, current), {})
            }
          }
      },
      {
        "name": "Method", "symbols": ["__", "name", { "literal": "(" }, "Args", { "literal": ")" }, { "literal": ":" }, "_", "name", { "literal": ";" }], "postprocess":
          (data) => {
            return {
              [data[1]]: {
                input: data[3],
                output: data[7]
              }
            };
          }
      },
      { "name": "Args", "symbols": ["Arg", { "literal": "," }, "_", "Args"], "postprocess": (data) => Object.assign({}, data[3], data[0]) },
      { "name": "Args", "symbols": ["Arg"], "postprocess": id },
      { "name": "Args", "symbols": [] },
      { "name": "Arg", "symbols": ["name", { "literal": ":" }, "_", "name"], "postprocess": (data) => ({ [data[0]]: data[3] }) },
      { "name": "name$ebnf$1", "symbols": [/[a-zA-Z<>]/] },
      { "name": "name$ebnf$1", "symbols": ["name$ebnf$1", /[a-zA-Z<>]/], "postprocess": function arrpush(d) { return d[0].concat([d[1]]); } },
      { "name": "name", "symbols": ["name$ebnf$1"], "postprocess": ([data]) => data.join('') },
      { "name": "_$ebnf$1", "symbols": [] },
      { "name": "_$ebnf$1", "symbols": ["_$ebnf$1", "wschar"], "postprocess": function arrpush(d) { return d[0].concat([d[1]]); } },
      { "name": "_", "symbols": ["_$ebnf$1"], "postprocess": function (d) { return ''; } },
      { "name": "__$ebnf$1", "symbols": ["wschar"] },
      { "name": "__$ebnf$1", "symbols": ["__$ebnf$1", "wschar"], "postprocess": function arrpush(d) { return d[0].concat([d[1]]); } },
      { "name": "__", "symbols": ["__$ebnf$1"], "postprocess": function (d) { return ''; } },
      { "name": "wschar", "symbols": [/[ \t\n\v\f]/], "postprocess": id }
    ]
    , ParserStart: "main"
  }
  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = grammar;
  } else {
    window.grammar = grammar;
  }
})();
