const ts = require('typescript');

const rewritePath = (importPath, { alias, regexes }) => {
  const patterns = Object.keys(alias);

  for (const pattern of patterns) {
    const regex = regexes[pattern];
    if (regex.test(importPath)) {
      return importPath.replace(regex, alias[pattern]);
    }
  }

  return importPath;
};

const isDynamicImport = node =>
  ts.isCallExpression(node) && node.expression.kind === ts.SyntaxKind.ImportKeyword;

const visitor = (ctx, sf, options) => {
  const _visitor = node => {
    let importPath;
    if ((ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) && node.moduleSpecifier) {
      const importPathWithQuotes = node.moduleSpecifier.getText(sf);
      importPath = importPathWithQuotes.substr(1, importPathWithQuotes.length - 2);
    } else if (isDynamicImport(node)) {
      const importPathWithQuotes = node.arguments[0].getText(sf);
      importPath = importPathWithQuotes.substr(1, importPathWithQuotes.length - 2);
    } else if (ts.isImportTypeNode(node) &&
             ts.isLiteralTypeNode(node.argument) &&
             ts.isStringLiteral(node.argument.literal)) {
      importPath = node.argument.literal.text;
    }
    if (importPath) {
      const rewrittenPath = rewritePath(importPath, options);
      const newNode = ts.getMutableClone(node);
      if (rewrittenPath !== importPath) {
        if (ts.isImportDeclaration(newNode) || ts.isExportDeclaration(newNode)) {
          newNode.moduleSpecifier = ts.createLiteral(rewrittenPath);
        } else if (isDynamicImport(newNode)) {
          newNode.arguments = ts.createNodeArray([ts.createStringLiteral(rewrittenPath)]);
        } else if (ts.isImportTypeNode(newNode)) {
          newNode.argument = ts.createLiteralTypeNode(ts.createStringLiteral(rewrittenPath));
        }
        return newNode;
      }
    }
    return ts.visitEachChild(node, _visitor, ctx);
  };
  return _visitor;
};

const rewrite = options => {
  const { alias = {} } = options;

  options.regexes = Object.keys(alias).reduce((stored, pattern) => ({
    ...stored, ...{ [pattern]: new RegExp(pattern) }
  }), {});

  return ctx => sf => ts.visitNode(sf, visitor(ctx, sf, options));
};

const snowpackImportRewriter = () =>
  rewrite({
    alias: {
      '^([a-z@][\\w\/-]+)$': '/modules/$1.js'
    }
  })



module.exports = { rewrite, snowpackImportRewriter };
