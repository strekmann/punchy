import '../public/site.scss';

import IsomorphicRelay from 'isomorphic-relay';
import IsomorphicRouter from 'isomorphic-relay-router';
import React from 'react';
import ReactDom from 'react-dom';
import Relay from 'react-relay';
import injectTapEventPlugin from 'react-tap-event-plugin';
import routes from '../common/routes';
import moment from 'moment';

moment.locale('en');

import {
    match,
    Router,
    browserHistory,
} from 'react-router';

injectTapEventPlugin();

const environment =new Relay.Environment();
environment.injectNetworkLayer(new Relay.DefaultNetworkLayer('/graphql', {
    credentials: 'same-origin',
}));

IsomorphicRelay.injectPreparedData(environment, window.__INITIAL_STATE__);

match({ routes, history: browserHistory }, (err, redirectLocation, renderProps) => {
    IsomorphicRouter.prepareInitialRender(environment, renderProps).then(props => {
        ReactDom.render(<Router {...props} />, document.getElementById('app'));
    });
});
