import React from 'react';
import Relay from 'react-relay';
import {
    Route,
    IndexRoute,
    createRoutes,
} from 'react-router';

import App from './components/App';
import NotFound from './components/NotFound';

export const viewerQuery = {
    viewer: () => {
        return Relay.QL`query { viewer }`;
    },
};

export default createRoutes(
    <Route path="/" component={App} queries={viewerQuery}>
        <IndexRoute component={Index} queries={viewerQuery} />
        <Route path="*" component={NotFound} />
    </Route>,
);
