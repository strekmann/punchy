import React from 'react';

export default class HoursItem extends React.Component {
    static propTypes = {
        hours: React.PropTypes.object,
    }
    state = {
        editing: false,
    }
    render() {
        const {
            id,
            project,
            date,
            start,
            end,
            duration,
        } = this.props.hours;
        if (this.state.editing) {
            return (
                <form>
                    TULL
                </form>
            );
        }
        return (
            <tr key={id}>
                <td>{project.name}</td>
                <td>{date}</td>
                <td>{start}</td>
                <td>{end}</td>
                <td>{duration}</td>
            </tr>
        );
    }
}
