/*
To complete the subscription setup, you'll need to use one of the
available PubSub engines for publishing and subscribing to evetns.
*/

import { PubSub } from 'graphql-subscriptions';

import * as MESSAGE_EVENTS from './message';

export const EVENTS = {
    MESSAGE: MESSAGE_EVENTS,
};

export default new PubSub();