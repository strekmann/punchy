import Helmet from 'react-helmet';
import React from 'react';
import Relay from 'react-relay';

import helmetConfig from '../../../config/helmet';

class App extends React.Component {
    static propTypes = {
        children: React.PropTypes.element,
    }

    render() {
        return (
            <div>
                <Helmet
                    defaultTitle={helmetConfig.defaultTitle}
                    titleTemplate={helmetConfig.titleTemplate}
                    meta={helmetConfig.meta}
                />
                { this.props.children }
            </div>
        );
    }
}

export default Relay.createContainer(App, {
    fragments: {
        viewer: () => {
            return Relay.QL`
            fragment on User {
                id,
            }`;
        },
    },
});
