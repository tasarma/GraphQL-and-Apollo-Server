import { gql } from 'apollo-server-express';

import userSchema from './user';
import messageSchema from './message';

// Both schemas are merged with the help of a utility called linkSchema.

const linkSchema = gql`
  type Query {
    _: Boolean
  }

  type Mutation {
    _: Boolean
  }

  type Subscription {
    _: Boolean
  }
`

export default [linkSchema, userSchema, messageSchema];