import { GraphQLDateTime } from 'graphql-iso-date';

import userResolver from './user';
import messageResolver from './message';


const customScalarResolver = {
    Date: GraphQLDateTime,
};


export default [
    userResolver,
    messageResolver,
    customScalarResolver,
];