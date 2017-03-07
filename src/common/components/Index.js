/* global navigator */

import React from 'react';
import Relay from 'react-relay';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import theme from '../theme';

import Landing from './Landing';
import Registration from './Registration';

class Index extends React.Component {
    static propTypes = {
        site: React.PropTypes.object.isRequired,
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
        if (this.props.site.viewer) {
            return <Registration site={this.props.site} />;
        }
        return <Landing site={this.props.site} />;
    }
}

export default Relay.createContainer(Index, {
    fragments: {
        site: () => {
            return Relay.QL`
            fragment on Site {
                viewer {
                    id
                }
                ${Landing.getFragment('site')}
                ${Registration.getFragment('site')}
            }`;
        },
    },
});
