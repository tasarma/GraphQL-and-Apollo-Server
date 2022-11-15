import { gql } from 'apollo-server-express';

export default gql`
  extend type Query {

    messages(cursor: String, limit: Int): MessageConnection!
    message(id: ID!): Message!
  }

  extend type Mutation {
    createMessage(text: String!): Message!
    deleteMessage(id: ID!): Boolean!
    updateMessage(id: ID! text: String!): Message!
  }

  type MessageConnection {
    edges: [Message]!
    pageInfo: PageInfo!
  }

  type PageInfo {
    hasNextPage: Boolean!
    endCursor: String!
  }

  type Message {
    id: ID!
    text: String!
    createdAt: Date!
    user: User!
  }

  extend type Subsription {
    messageCreated: MessageCreated!
  }

  type MessageCreated {
    message: Message!
  }
`;
