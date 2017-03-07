import DatePicker from 'material-ui/DatePicker';
import RaisedButton from 'material-ui/RaisedButton';
import TimePicker from 'material-ui/TimePicker';
import TextField from 'material-ui/TextField';
import moment from 'moment';
import 'moment-duration-format';
import React from 'react';
import Relay from 'react-relay';
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
    state = {
        loadedDay: moment().startOf('day'),
        date: moment(),
        start: undefined,
        stop: undefined,
        duration: '',
        comment: '',
    }

    onSave = () => {
        if (this.isChanged()) {
            const data = {
                date: this.state.date.clone().startOf('day').toDate(),
                duration: moment.duration(this.state.duration).asHours(),
                comment: this.state.comment,
            };
            if (this.state.start) {
                data.start = mergeTime(this.state.date, this.state.start).toDate();
            }
            if (this.state.stop) {
                data.stop = mergeTime(this.state.date, this.state.stop).toDate();
            }
            console.log(data, "DATA");
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
        if (!this.state.duration.toString().includes(':')) {
            const hours = this.state.duration.replace(',', '.');
            this.setState({
                duration: moment.duration({ hours }).format('h:mm'),
            });
        }
    }

    render() {
        return (
            <Container className="wrapper">
                <h1>Registrering</h1>
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
                                    newState.duration = this.state.stop.diff(mstart, 'hours', true);
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
                                        newState.duration = mstop.diff(this.state.start, 'hours', true);
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
                    />
                </div>
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
                                name
                            }
                        }
                    }
                }
            `;
        },
    },
});
