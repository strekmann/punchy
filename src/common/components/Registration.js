import DatePicker from 'material-ui/DatePicker';
import FontIcon from 'material-ui/FontIcon';
import RaisedButton from 'material-ui/RaisedButton';
import TimePicker from 'material-ui/TimePicker';
import TextField from 'material-ui/TextField';
import moment from 'moment';
import React from 'react';
import Container from './Container';

class Registration extends React.Component {
    state = {
        date: moment().toDate(),
        start: undefined,
        stop: undefined,
        duration: '',
    }

    onSave = () => {
        console.log(this.state);
    }

    render() {
        return (
            <Container className="wrapper">
                <h1>Registrering</h1>
                <div style={{ display: 'flex', alignItems: 'baseline' }}>
                    <FontIcon
                        className="material-icons"
                    >
                        today
                    </FontIcon>
                    <DatePicker
                        id="date"
                        floatingLabelText="Date"
                        value={this.state.date}
                        onChange={(_, date) => {
                            this.setState({ date });
                        }}
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline' }}>
                    <FontIcon
                        className="material-icons"
                    >
                        timer
                    </FontIcon>
                    <TimePicker
                        id="start"
                        floatingLabelText="Start"
                        format="24hr"
                        value={this.state.start}
                        onChange={(_, start) => {
                            this.setState({ start });
                        }}
                    />
                    <FontIcon
                        className="material-icons"
                    >
                        timer_off
                    </FontIcon>
                    <TimePicker
                        id="stop"
                        floatingLabelText="Stop"
                        format="24hr"
                        value={this.state.end}
                        onChange={(_, stop) => {
                            this.setState({ stop });
                        }}
                    />
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline' }}>
                    <FontIcon
                        className="material-icons"
                    >
                        timelapse
                    </FontIcon>
                    <TextField
                        id="duration"
                        floatingLabelText="Duration"
                        type="Number"
                        value={this.state.duration}
                        onChange={(_, duration) => {
                            this.setState({ duration });
                        }}
                    />
                </div>
                <div>
                    <RaisedButton
                        label="Save"
                        primary
                        onClick={this.onSave}
                    />
                </div>
            </Container>
        );
    }
}

export default Registration;
