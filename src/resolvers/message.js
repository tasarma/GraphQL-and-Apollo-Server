import { ForbiddenError } from 'apollo-server';
import { v4 as uuidv4 } from 'uuid';
import { combineResolvers } from 'graphql-resolvers';

import { isAuthenticated, isMessageOwner } from './authorization';
import { Sequelize } from 'sequelize';

export default {
    Query: {
      messages: async (
        parent, 
        { cursor, limit=100 }, 
        { models }) => { 
        return await models.Message.findAll({
          order: [['createdAt', 'DESC']], 
          limit,
          where: cursor ? {
            createdAt: {
              [Sequelize.Op.lt]: cursor,
            },
          }: null,
        }); 
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