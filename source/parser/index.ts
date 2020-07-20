import ts from 'typescript';

// {
//   "PlanetServiceInterface": {
//     "browse": {
//       "input": {
//         "a": "string"
//       },
//       "output": "Promise<Planet>"
//     }
//   }
// }

export const parser = input => {
  const node = ts.createSourceFile('x.ts', input, ts.ScriptTarget.Latest);

  let result;
  node.forEachChild(child => {
    if (ts.SyntaxKind[child.kind] === 'InterfaceDeclaration') {
      result = child;
    }
  });

  const toPrimitiveType = kind => {
    switch (kind) {
      case 'StringKeyword':
        return 'string';
      case 'NumberKeyword':
        return 'number';
      case 'BooleanKeyword':
        return 'boolean';
      case 'AnyKeyword':
        return 'any';
      default:
        break;
    }
  }

  const r = {};

  const interfaceName = result.name.escapedText;
  r[interfaceName] = {};

  for (const { name, type, parameters } of result.members) {
    const methodName = name.escapedText;
    r[interfaceName][methodName] = {
      output: '',
      input: {},
    };

    if (ts.SyntaxKind[type.kind] === 'TypeReference') {
      const returnType = `${type.typeName.escapedText}<${type.typeArguments.map(({ typeName }) => typeName.escapedText).join(",")}>`;
      r[interfaceName][methodName].output = returnType;
    } else {
      const returnType = `${ts.SyntaxKind[type.kind]}`;
      r[interfaceName][methodName].output = returnType;
    }

    for (const { name, type } of parameters) {
      if (ts.SyntaxKind[type.kind] === 'TypeReference') {
        r[interfaceName][methodName].input[name.escapedText] = type.typeName.escapedText;
      } else if (ts.SyntaxKind[type.kind] === 'ArrayType') {
        r[interfaceName][methodName].input[name.escapedText] = `${toPrimitiveType(ts.SyntaxKind[type.elementType.kind])}[]`;
      } else {
        r[interfaceName][methodName].input[name.escapedText] = toPrimitiveType(ts.SyntaxKind[type.kind]);
      }
    }
  }

  return r;
};
