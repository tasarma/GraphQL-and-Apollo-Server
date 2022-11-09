import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import jwt from 'jsonwebtoken';
import { ApolloServer, AuthenticationError } from 'apollo-server-express';


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
  const server = new ApolloServer({
    typeDefs: schema,
    resolvers,
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

    // bir kere db yi gecirmeye calis her seferinde yenilemesin
    context: async ({ req }) => {
      const me = await getMe(req);
      
      return { 
        models,
        me,
        secret: process.env.SECRET,
      };
    },

    // introspection: true,
  });

  await server.start();

  server.applyMiddleware({
    app,
    path: '/',
  });

  sequelize.sync({ force: eraseDatabaseOnSync }).then(async () => {
    if (eraseDatabaseOnSync) {
      createUsersWithMessagges();
    }

    app.listen({ port: 8000 }, () => {
      console.log('Apollo server on 8000/');
    });
  });
  
  const createUsersWithMessagges = async () => {
    await models.User.create({
      username: 'rwieruch',
      email: 'hello@robin.com',
      password: 'rwieruch',
      role: 'ADMIN',
      messages: [
        {
          text: 'published the road to learn react',
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
          },
          {
            text: 'Published a complete ...',
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
