import React from 'react';
import Container from './Container';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import theme from '../theme';

export default class NotFound extends React.Component {
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
            <Container className="wrapper">
                <h1>404</h1>
                <p>What you are looking for is not here …</p>
            </Container>
        );
    }
}
