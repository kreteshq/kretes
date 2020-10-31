import { HTMLString, JSONPayload } from "../response";
import { join } from 'path';

export const OpenAPI = (paths) => {
  const packageJSONPath = join(process.cwd(), 'package.json');
  const { title = "", description = "", version = ""} = require(packageJSONPath);

  return JSONPayload({ openapi: "3.0.0", info: { title, description, version }, paths });
};

export const RedocApp = () => {
  return HTMLString(`
<!DOCTYPE html>
<html>
  <head>
    <title>ReDoc</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700" rel="stylesheet">

    <style>
      body {
        margin: 0;
        padding: 0;
      }
    </style>
  </head>
  <body>
    <redoc spec-url='/__rest.json'></redoc>
    <script src="https://cdn.jsdelivr.net/npm/redoc@next/bundles/redoc.standalone.js"> </script>
  </body>
</html>
  `);
};
