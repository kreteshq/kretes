import { graphql } from "graphql";
import { withPostGraphileContext, createPostGraphileSchema, } from "postgraphile";
import PgSimplifyInflectorPlugin from "@graphile-contrib/pg-simplify-inflector";
import { makeExtendSchemaPlugin, gql } from "graphile-utils";

async function makeGraphQLRunner(pgPool) {
  const schema = await createPostGraphileSchema(pgPool, "public", { 
    appendPlugins: [
      PgSimplifyInflectorPlugin,
      makeExtendSchemaPlugin(build => {
        // Get any helpers we need from `build`
        const { pgSql: sql, inflection } = build;
      
        return {
          typeDefs: gql`
            extend type Query {
              hello: String
            }
          `,
          resolvers: {
            Query: {
              hello: () => "Hello, GraphQL"
            }
          },
        };
      }),
    ] 
  });

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
