// Copyright Zaiste. All rights reserved.
// Licensed under the Apache License, Version 2.0

import { Handler } from 'index';
export type Endpoint = (options?: Object) => Handler | Promise<Handler>;

export { GraphQL, GraphiQL } from './graphql';
