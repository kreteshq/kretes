import { graphql } from "graphql";
import { withPostGraphileContext, createPostGraphileSchema, } from "postgraphile";
import PgSimplifyInflectorPlugin from "@graphile-contrib/pg-simplify-inflector";

async function makeGraphQLRunner(pgPool) {
  const schema = await createPostGraphileSchema(pgPool, "public", { appendPlugins: [PgSimplifyInflectorPlugin] });

  const query = async (graphqlQuery, variables = {}) => {
    return await withPostGraphileContext({ pgPool },
      async (context) => {
        return await graphql(
          schema,
          graphqlQuery,
          null,
          { ...context },
          variables,
        );
      }
    );
  };

  return {
    query,
  };
}

export { makeGraphQLRunner };
