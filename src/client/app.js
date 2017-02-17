/* global window, document */

import IsomorphicRelay from 'isomorphic-relay';
import IsomorphicRouter from 'isomorphic-relay-router';
import moment from 'moment';
import React from 'react';
import ReactDom from 'react-dom';
import Relay from 'react-relay';
import {
    match,
    Router,
    browserHistory,
} from 'react-router';
import injectTapEventPlugin from 'react-tap-event-plugin';
import routes from '../common/routes';
import '../public/site.scss';

moment.locale('en');
injectTapEventPlugin();

const environment = new Relay.Environment();
environment.injectNetworkLayer(new Relay.DefaultNetworkLayer('/graphql', {
    credentials: 'same-origin',
}));

IsomorphicRelay.injectPreparedData(environment, window.__INITIAL_STATE__);

match({ routes, history: browserHistory }, (err, redirectLocation, renderProps) => {
    IsomorphicRouter.prepareInitialRender(environment, renderProps).then((props) => {
        ReactDom.render(<Router {...props} />, document.getElementById('app'));
    });
});
