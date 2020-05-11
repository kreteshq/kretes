main -> _ "import" __ .:* declaration {% (data) => data[4] %}

declaration -> _ "export default" interface {% (data) => data[2] %}
             | _ "export" interface
             | interface

interface -> _ "interface" __ name _ "{" (Method):* _ "}" _ {%
  (data) => {
    return {
      [data[3]]: data[6].flat().reduce((stored, current) => Object.assign(stored, current), {})
    }
  }
%}
Method -> __ name "(" Args ")" ":" _ name ";" {%
  (data) => {
    return {
      [data[1]]: {
        input: data[3],
        output: data[7]
      }
    };
  }
%}
Args -> Arg "," _ Args {% (data) => Object.assign({}, data[3], data[0]) %}
  | Arg {% id %}
  | null
Arg -> name ":" _ name {% (data) => ({ [data[0]]: data[3] }) %}
name -> [a-zA-Z<>]:+ {% ([data]) => data.join('') %}

_  -> wschar:* {% function(d) {return '';} %}
__ -> wschar:+ {% function(d) {return '';} %}
wschar -> [ \t\n\v\f] {% id %}
