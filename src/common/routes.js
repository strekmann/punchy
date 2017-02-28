import React from 'react';
import Relay from 'react-relay';
import {
    Route,
    IndexRoute,
    createRoutes,
} from 'react-router';

import App from './components/App';
import Index from './components/Index';
import NotFound from './components/NotFound';

export const query = {
    site: () => {
        return Relay.QL`query { site }`;
    },
};

export default createRoutes(
    <Route path="/" component={App} queries={query}>
        <IndexRoute component={Index} queries={query} />
        <Route path="*" component={NotFound} />
    </Route>,
);
