import React from 'react';

function getStyles(props, context) {
    const {
        baseTheme,
    } = context.muiTheme;

    const {
        className,
        style,
        noPadding,
        flexLayout,
        flex,
    } = props;

    const styles = {
        padding: noPadding ? 0 : baseTheme.spacing.desktopGutter,
    };

    if (flexLayout) {
        styles.display = 'flex';
        styles.flexDirection = flexLayout;
        styles.alignItems = 'baseline';
    }

    if (flex) {
        styles.flex = flex;
    }
    return Object.assign(styles, style);
}

export default class Container extends React.Component {
    static propTypes = {
        children: React.PropTypes.node,
        className: React.PropTypes.string,
        id: React.PropTypes.string,
        style: React.PropTypes.object,
        noPadding: React.PropTypes.bool,
        flexLayout: React.PropTypes.string,
        flex: React.PropTypes.string,
    }

    static contextTypes = {
        muiTheme: React.PropTypes.object.isRequired,
    }

    render() {
        const styles = getStyles(this.props, this.context);
        const classes = [];
        if (this.props.flexLayout) { classes.push(this.props.flexLayout); }
        if (this.props.className) { classes.push(this.props.className); }
        return (
            <div id={this.props.id} className={ classes.join(' ')} style={styles}>
                { this.props.children }
            </div>
        );
    }
}
