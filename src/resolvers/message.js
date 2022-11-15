import { ForbiddenError } from 'apollo-server';
import { v4 as uuidv4 } from 'uuid';
import { combineResolvers } from 'graphql-resolvers';

import { isAuthenticated, isMessageOwner } from './authorization';
import { Sequelize } from 'sequelize';


const toCursorHash = string => Buffer.from(string).toString('base64');
const fromCursorHash = string => Buffer.from(string, 'base64').toString('ascii');

export default {
    Query: {
      messages: async (parent, { cursor, limit=100 }, { models }) => {
          const cursorOptions = cursor
          ? {
            where: {
              createdAt: {
                [Sequelize.Op.lt]: fromCursorHash,
              },
            },
          }: {};

          const messages = await models.Message.findAll({
            order: [['createdAt', 'DESC']], 
            limit: limit + 1,
            ...cursorOptions,
          });

          const hasNextPage = messages.length > limit;
          const edges = hasNextPage ? messages.slice(0, -1) : messages;

          return {
            edges,
            pageInfo: {
              hasNextPage,
              endCursor: toCursorHash(
                edges[edges.length - 1].createdAt.toString(),
              ),
            },
          }; 
        },

        message: async (parent, { id }, { models }) => { 
          return await models.Message.findByPk(id); 
        }
    },
  
    Mutation: {
      createMessage: combineResolvers(
        isAuthenticated,
        async (parent, { text }, { me, models }) => {
        return await models.Message.create({
          text,
          userId: me.id,
        });
      }),
  
      deleteMessage: combineResolvers(
        isAuthenticated,
        isMessageOwner,
        async (parent, { id }, { models }) => {
        return await models.Message.destroy({
          where: {
            id
          }
        });
      }),
  
      updateMessage: async (parent, { id, text }, { me, models }) => {
        return await models.Message.update({
          id,
          text,
          userId: me.id
        });    
      }
    },
  
    Message: {
      user: async (message, args, { models }) => { 
        return await models.User.findByPk(message.userId); 
    }
    },
  };