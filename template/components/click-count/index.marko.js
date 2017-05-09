// Compiled using marko@4.2.8 - DO NOT EDIT
"use strict";

var marko_template = module.exports = require("marko/html").t(__filename),
    marko_component = {
        onCreate: function() {
          this.state = {
              count: 0
            };
        },
        increment: function() {
          this.state.count++;
        }
      },
    marko_components = require("marko/components"),
    marko_registerComponent = marko_components.rc,
    marko_componentType = marko_registerComponent("/marko-huncwot$1.0.0/components/click-count/index.marko", function() {
      return module.exports;
    }),
    marko_helpers = require("marko/runtime/html/helpers"),
    marko_escapeXml = marko_helpers.x,
    marko_attr = marko_helpers.a;

function render(input, out, __component, component, state) {
  var data = input;

  out.w("<div class=\"count\"" +
    marko_attr("id", __component.elId("_r0")) +
    "><p class=\"title count\">" +
    marko_escapeXml(state.count) +
    "</p></div><button class=\"is-danger button is-outlined\"" +
    marko_attr("id", __component.elId("_r1")) +
    marko_attr("data-marko", {
      onclick: __component.d("increment")
    }, false) +
    ">Click me!</button>");
}

marko_template._ = marko_components.r(render, {
    type: marko_componentType,
    roots: [
      "_r0",
      "_r1"
    ]
  }, marko_component);

marko_template.Component = marko_components.c(marko_component, marko_template._);

marko_template.meta = {
    deps: [
      {
          type: "css",
          code: ".count {\n        font-size:3em;\n    }\n    .example-button {\n        font-size:1em;\n        padding:0.5em;\n    }",
          virtualPath: "./index.marko.css",
          path: "./index.marko"
        },
      {
          type: "require",
          path: "./"
        }
    ]
  };
