import React from 'react';
import Paper from 'material-ui/Paper';

function getStyles(props, context) {
    const {
        baseTheme,
    } = context.muiTheme;

    const {
        // className,
        style,
    } = props;

    const styles = {
        padding: baseTheme.spacing.desktopGutter,
    };

    return Object.assign(styles, style);
}

export default class Sheet extends React.Component {
    static propTypes = {
        children: React.PropTypes.node,
        id: React.PropTypes.string,
        style: React.PropTypes.object,
    }

    static contextTypes = {
        muiTheme: React.PropTypes.object.isRequired,
    }

    render() {
        const {
            children,
            id,
            style,
            ...other
        } = this.props;

        const styles = getStyles(this.props, this.context);

        return (
            <Paper {...other} id={id} style={styles} className="sheet">
                { children }
            </Paper>
        );
    }
}
