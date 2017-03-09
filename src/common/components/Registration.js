import 'moment-duration-format';
import React from 'react';
import Relay from 'react-relay';
import CreateHoursMutation from '../mutations/createHours';
import Container from './Container';
import HoursForm from './HoursForm';
import HoursItem from './HoursItem';

class Registration extends React.Component {
    static contextTypes = {
        relay: Relay.PropTypes.Environment,
    }

    static propTypes = {
        site: React.PropTypes.object,
    }
    onCreateHours = (data) => {
        console.log(data, "DATA");
        this.context.relay.commitUpdate(new CreateHoursMutation({
            viewer: this.props.site.viewer,
            project: data.project,
            date: data.date,
            start: data.start,
            end: data.stop,
            duration: data.duration,
            comment: data.comment,
        }), {
            onSuccess: ({ createHours }) => {
                if (createHours.errors.length > 0) {
                    const errors = Object.assign(...createHours.errors.map((error) => {
                        return { [error.key]: error.msg };
                    }));
                    /* replaces:
                    const errors = createHours.errors.reduce((m, o) => {
                        m[o.key] = o.msg;
                        return m;
                    }, {});
                    // TODO: needs testing */

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
        /*
        else {
            // now
            const data = {
                date: this.state.date.clone().startOf('day').toDate(),
                start: this.state.date.clone().startOf('minute').toDate(),
            };
            console.log(data, "now");
        }
        */
    }

    render() {
        const { viewer } = this.props.site;
        return (
            <Container className="wrapper">
                <h1>Registrering</h1>
                <HoursForm site={this.props.site} createHours={this.onCreateHours} saveButtonText="Create" />
                <table>
                    <tbody>
                        {viewer.hours.edges.map((edge) => {
                            return <HoursItem key={edge.node.id} hours={edge.node} />;
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
                    ${HoursForm.getFragment('site')}
                }
            `;
        },
    },
});
