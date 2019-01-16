import {
  addMockFunctionsToSchema,
  gql,
  makeExecutableSchema,
} from 'apollo-server-koa';
import { GraphQLSchema } from 'graphql';

const userSchema: GraphQLSchema = makeExecutableSchema({
  typeDefs: gql`
    scalar Date
    scalar JSON
    scalar ObjectID
    scalar EmailAddress

    type Query {
      me: User
      users: [User]
    }
    type Mutation {
      activateAccount(token: String): String
      signUpUser(input: UserIn!): String
      login(email: EmailAddress!, password: String!): String
      deleteUser(id: ObjectID!): User
      updateUser(id: ObjectID!, input: UserIn!): User
    }

    type User {
      id: ObjectID
      email: EmailAddress
      password: String
      name: String
      center: String
      active: Boolean
      sign_up_token: String
      auth_token: String
      notifications: Boolean
      createdAt: Date
      updatedAt: Date
      signUpSurvey: JSON
    }

    input UserIn {
      email: EmailAddress
      password: String
      name: String
      center: String
      active: Boolean
      sign_up_token: String
      auth_token: String
      notifications: Boolean
      signUpSurvey: JSON
    }
  `,
});

addMockFunctionsToSchema({ schema: userSchema });

export default userSchema;