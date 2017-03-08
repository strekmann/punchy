import AutoComplete from 'material-ui/AutoComplete';
import DatePicker from 'material-ui/DatePicker';
import RaisedButton from 'material-ui/RaisedButton';
import TimePicker from 'material-ui/TimePicker';
import TextField from 'material-ui/TextField';
import moment from 'moment';
import 'moment-duration-format';
import React from 'react';
import Relay from 'react-relay';
import CreateHoursMutation from '../mutations/createHours';
import Container from './Container';
import IconWrapper from './IconWrapper';

// Util functions
function mergeTime(date, time) {
    if (date && time) {
        const mdate = date.clone();
        mdate.hour(time.hour());
        mdate.minute(time.minute());
        return mdate.startOf('minute');
    }
    return date;
}

class Registration extends React.Component {
    static contextTypes = {
        relay: Relay.PropTypes.Environment,
    }

    static propTypes = {
        site: React.PropTypes.object,
    }

    state = {
        loadedDay: moment().startOf('day'),
        date: moment(),
        start: undefined,
        stop: undefined,
        duration: '',
        project: undefined,
        comment: '',
    }

    onCreateHours = () => {
        if (this.isChanged()) {
            const data = {
                date: this.state.date.clone().startOf('day').toDate(),
                duration: moment.duration(this.state.duration).asHours(),
            };
            if (this.state.start) {
                data.start = mergeTime(this.state.date, this.state.start).toDate();
            }
            if (this.state.stop) {
                data.stop = mergeTime(this.state.date, this.state.stop).toDate();
            }
            console.log(data, "DATA");
            this.context.relay.commitUpdate(new CreateHoursMutation({
                viewer: this.props.site.viewer,
                project: this.state.project,
                date: data.date,
                start: data.start,
                end: data.stop,
                duration: data.duration,
                comment: this.state.comment,
            }), {
                onSuccess: ({ createHours }) => {
                    if (createHours.errors.length > 0) {
                        const errors = createHours.errors.reduce((m, o) => {
                            m[o.key] = o.msg;
                            return m;
                        }, {});

                        this.setState({ errors });
                    }
                    else {
                        this.setState({
                            start: undefined,
                            end: undefined,
                            duration: '',
                            comment: '',
                        });
                    }
                },
            });
        }
        else {
            // now
            const data = {
                date: this.state.date.clone().startOf('day').toDate(),
                start: this.state.date.clone().startOf('minute').toDate(),
            };
            console.log(data, "now");
        }
    }

    isChanged = () => {
        return this.state.start || !this.state.loadedDay.isSame(this.state.date.clone().startOf('day'));
    }

    formatDuration = () => {
        // TODO: Check if we need the toStrings, as we should set the state value to a string
        // everywhere
        if (!this.state.duration.toString().includes(':')) {
            const hours = this.state.duration.toString().replace(',', '.');
            this.setState({
                duration: moment.duration({ hours }).format('h:mm'),
            });
        }
    }

    render() {
        const {
            projects,
            viewer,
        } = this.props.site;
        return (
            <Container className="wrapper">
                <h1>Registrering</h1>
                <IconWrapper iconName="find_in_page">
                    <AutoComplete
                        id="project"
                        filter={AutoComplete.fuzzyFilter}
                        floatingLabelText="Project"
                        onNewRequest={(chosen) => {
                            this.setState({ project: chosen.value });
                        }}
                        openOnFocus
                        dataSource={projects.edges.map((edge) => {
                            return { text: `${edge.node.name}`, value: edge.node };
                        })}
                    />
                </IconWrapper>
                <IconWrapper iconName="today">
                    <DatePicker
                        id="date"
                        floatingLabelText="Date"
                        value={this.state.date.toDate()}
                        onChange={(_, date) => {
                            this.setState({ date: moment(date) });
                        }}
                    />
                </IconWrapper>
                <div style={{ display: 'flex', width: '100%' }}>
                    <IconWrapper iconName="timer" style={{ flexGrow: '1' }}>
                        <TimePicker
                            id="start"
                            floatingLabelText="Start"
                            format="24hr"
                            value={this.state.start && this.state.start.toDate()}
                            onChange={(_, start) => {
                                const mstart = moment(start).startOf('minute');
                                const newState = { start: mstart };
                                if (this.state.stop) {
                                    // starting after ending: means continued into the next day.
                                    // Removing a day from the start, to fix the duration.
                                    if (this.state.stop.isBefore(mstart)) {
                                        mstart.subtract(1, 'day');
                                    }
                                    newState.duration = this.state.stop.diff(mstart, 'hours', true).toString();
                                }
                                this.setState(newState, this.formatDuration);
                            }}
                        />
                    </IconWrapper>
                    {this.isChanged()
                        ? <IconWrapper iconName="timer_off" style={{ flexGrow: '1' }}>
                            <TimePicker
                                id="stop"
                                floatingLabelText="Stop"
                                format="24hr"
                                value={this.state.stop && this.state.stop.toDate()}
                                onChange={(_, stop) => {
                                    const mstop = moment(stop).startOf('minute');
                                    const newState = { stop: mstop };
                                    if (this.state.start) {
                                        // starting after ending: means continued into the next
                                        // day. Adding a day from the stop, to fix the duration.
                                        if (this.state.start.isAfter(mstop)) {
                                            mstop.add(1, 'day');
                                        }
                                        newState.duration = mstop.diff(this.state.start, 'hours', true).toString();
                                    }
                                    this.setState(newState, this.formatDuration);
                                }}
                            />
                        </IconWrapper>
                        : null
                    }
                </div>
                {this.isChanged()
                    ? <IconWrapper iconName="timelapse">
                        <TextField
                            id="duration"
                            floatingLabelText="Duration"
                            value={this.state.duration}
                            onChange={(_, duration) => {
                                this.setState({ duration });
                            }}
                            onBlur={() => { this.formatDuration(); }}
                        />
                    </IconWrapper>
                    : null
                }
                {this.isChanged()
                    ? <IconWrapper iconName="short_text">
                        <TextField
                            id="comment"
                            floatingLabelText="Comment"
                            fullWidth
                            multiLine
                            value={this.state.comment}
                            onChange={(_, comment) => {
                                this.setState({ comment });
                            }}
                        />
                    </IconWrapper>
                    : null
                }
                <div>
                    <RaisedButton
                        label={this.isChanged() ? 'Save' : 'Start now'}
                        primary
                        onClick={this.onSave}
                        disabled={!this.state.project}
                        onTouchTap={this.onCreateHours}
                    />
                </div>
                <table>
                    <tbody>
                        {viewer.hours.edges.map((edge) => {
                            const {
                                id,
                                project,
                                date,
                                start,
                                end,
                                duration,
                            } = edge.node;
                            return (
                                <tr key={id}>
                                    <td>{project.name}</td>
                                    <td>{date}</td>
                                    <td>{start}</td>
                                    <td>{end}</td>
                                    <td>{duration}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </Container>
        );
    }
}

export default Relay.createContainer(Registration, {
    fragments: {
        site: () => {
            return Relay.QL`
                fragment on Site {
                    projects(first:1000) {
                        edges {
                            node {
                                id
                                name
                            }
                        }
                    },
                    viewer {
                        hours(first:10) {
                            edges {
                                node {
                                    id
                                    project { name }
                                    date
                                    start
                                    end
                                    duration
                                }
                            }
                        }
                        ${CreateHoursMutation.getFragment('viewer')}
                    }
                }
            `;
        },
    },
});
