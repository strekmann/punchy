/* global navigator */

import React from 'react';
import Relay from 'react-relay';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import theme from '../theme';

import Container from './Container';

class Index extends React.Component {
    static propTypes = {
        viewer: React.PropTypes.object,
        relay: React.PropTypes.object.isRequired,
    }

    static contextTypes = {
        relay: Relay.PropTypes.Environment,
    };

    static childContextTypes = {
        muiTheme: React.PropTypes.object.isRequired,
    }

    constructor(props) {
        super(props);
        this.muiTheme = getMuiTheme(theme, { userAgent: navigator.userAgent });
    }

    getChildContext() {
        return { muiTheme: this.muiTheme };
    }

    render() {
        return (
            <Container className="wrapper" id="index">
                <h2>Derp derp</h2>
                <a href="/auth/google">Login</a>
            </Container>
        );
    }
}

export default Relay.createContainer(Index, {
    fragments: {
        viewer: () => {
            return Relay.QL`
            fragment on User {
                id
            }`;
        },
    },
});
