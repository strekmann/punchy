import FontIcon from 'material-ui/FontIcon';
import React from 'react';

export default class IconWrapper extends React.Component {
    static propTypes = {
        children: React.PropTypes.node,
        iconName: React.PropTypes.string.isRequired,
        style: React.PropTypes.object,
    }
    render() {
        return (
            <div style={{ display: 'flex', alignItems: 'flex-end', ...this.props.style }}>
                <FontIcon
                    className="material-icons"
                    style={{ marginBottom: 12 }}
                >
                    {this.props.iconName}
                </FontIcon>
                {this.props.children}
            </div>
        );
    }
}
