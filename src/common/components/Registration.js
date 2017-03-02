import DatePicker from 'material-ui/DatePicker';
import RaisedButton from 'material-ui/RaisedButton';
import TimePicker from 'material-ui/TimePicker';
import TextField from 'material-ui/TextField';
import moment from 'moment';
import 'moment-duration-format';
import React from 'react';
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
        if (this.old()) {
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

    old = () => {
        return this.state.start || !this.state.loadedDay.isSame(this.state.date.clone().startOf('day'));
    }

    formatDuration = () => {
        if (!this.state.duration.toString().includes(':')) {
            this.setState({
                duration: moment.duration({ hours: this.state.duration }).format('h:mm'),
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
                                    newState.duration = this.state.stop.diff(mstart, 'hours', true);
                                }
                                this.setState(newState, this.formatDuration);
                            }}
                        />
                    </IconWrapper>
                    {this.old()
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
                                        newState.duration = mstop.diff(this.state.start, 'hours', true);
                                    }
                                    this.setState(newState, this.formatDuration);
                                }}
                            />
                        </IconWrapper>
                        : null
                    }
                </div>
                {this.old()
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
                {this.old()
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
                        label={this.old() ? 'Save' : 'Start now'}
                        primary
                        onClick={this.onSave}
                    />
                </div>
            </Container>
        );
    }
}

export default Registration;
