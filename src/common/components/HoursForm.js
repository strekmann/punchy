import AutoComplete from 'material-ui/AutoComplete';
import DatePicker from 'material-ui/DatePicker';
import RaisedButton from 'material-ui/RaisedButton';
import TimePicker from 'material-ui/TimePicker';
import TextField from 'material-ui/TextField';
import moment from 'moment';
import React from 'react';
import Relay from 'react-relay';
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

function parseDuration(duration) {
    if (duration.includes(':')) {
        return moment.duration(duration);
    }
    const hours = duration.replace(',', '.');
    return moment.duration({ hours });
}

class HoursForm extends React.Component {
    static propTypes = {
        createHours: React.PropTypes.func,
        saveButtonText: React.PropTypes.string,
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
        tmpDuration: '',
    }

    onSave = () => {
        if (this.isChanged()) {
            const data = {
                comment: this.state.comment,
                date: this.state.date.clone().startOf('day').toDate(),
                duration: this.state.duration.asHours(),
                project: this.state.project,
            };
            if (this.state.start) {
                data.start = mergeTime(this.state.date, this.state.start).toDate();
            }
            if (this.state.stop) {
                data.stop = mergeTime(this.state.date, this.state.stop).toDate();
            }
            this.props.createHours(data);
        }
    }

    isChanged = () => {
        return this.state.start || !this.state.loadedDay.isSame(this.state.date.clone().startOf('day'));
    }

    formatDuration = () => {
        if (this.state.duration) {
            return this.state.duration.format('h:mm');
        }
        return 0;
    }

    render() {
        const { projects } = this.props.site;
        return (
            <div>
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
                                    const diff = this.state.stop.diff(mstart);
                                    newState.duration = moment.duration(diff);
                                }
                                this.setState(newState);
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
                                        const diff = mstop.diff(this.state.start);
                                        newState.duration = moment.duration(diff);
                                    }
                                    this.setState(newState);
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
                            value={
                                this.state.tmpDuration || this.formatDuration(this.state.duration)
                            }
                            onChange={(_, tmpDuration) => {
                                this.setState({ tmpDuration });
                            }}
                            onBlur={() => {
                                this.setState({
                                    duration: parseDuration(this.state.tmpDuration),
                                    tmpDuration: '',
                                });
                            }}
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
                        label={this.isChanged() ? this.props.saveButtonText || 'Save' : 'Start now'}
                        primary
                        disabled={!this.state.project}
                        onTouchTap={this.onSave}
                    />
                </div>
            </div>
        );
    }
}

export default Relay.createContainer(HoursForm, {
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
            }`;
        },
    },
});
