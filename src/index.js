import 'dotenv/config';
import cors from 'cors';
import http from 'http';
import express from 'express';
import jwt from 'jsonwebtoken';
import { ApolloServer, AuthenticationError } from 'apollo-server-express';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';

import schema from './schema'
import resolvers from './resolvers'
import models, { sequelize } from './models'

const app = express();

const eraseDatabaseOnSync = true;

app.use(cors());

const getMe = async req => {
  const token = req.headers['x-token'];
  if(token) {
    try {
      return await jwt.verify(token, process.env.SECRET);
    } catch (error) {
      throw new AuthenticationError('Your session expired. Sign in again.');
    }
  }
};

async function startApolloServer() {
  const httpServer = http.createServer(app);
  const server = new ApolloServer({
    typeDefs: schema,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],

    formatError: error => {
      // leave only the important validation error
      const message = error.message
        .replace('SequelizeValidationError: ', '')
        .replace('Validation error: ', '');

      return {
        ...error,
        message
      };
    },

    context: async ({ req, connection }) => {
      if (connection) {
        return {
          models,
        };
      }

      if (req){
        const me = await getMe(req);
        return { 
          models,
          me,
          secret: process.env.SECRET,
        };
      }
    },

    // introspection: true,
  });

  await server.start();

  server.applyMiddleware({ app, path: '/', });

  const isTest = !!process.env.TEST_DATABASE;
  sequelize.sync({ force: isTest }).then(async () => {
    if (isTest) {
      createUsersWithMessagges(new Date());
    }

    httpServer.listen({ port: 8000 }, () => {
      console.log('Apollo server on http://localhost:8000/');
    })
  });
  
  const createUsersWithMessagges = async (date) => {
    await models.User.create({
      username: 'rwieruch',
      email: 'hello@robin.com',
      password: 'rwieruch',
      role: 'ADMIN',
      messages: [
        {
          text: 'published the road to learn react',
          createdAt: date.setSeconds(date.getSeconds() + 1),
        },
      ],
    }, {
      include: [models.Message],
    });
    
    await models.User.create(
      {
        username: 'ddavids',
        email: 'hello@david.com',
        password: 'ddavids',
        messages: [
          {
            text: 'Happy to release ...',
            createdAt: date.setSeconds(date.getSeconds() + 1),
          },
          {
            text: 'Published a complete ...',
            createdAt: date.setSeconds(date.getSeconds() + 1),
          },
        ],
      },
      {
        include: [models.Message],
      },
    );
  }
}

startApolloServer();
