/* eslint "class-methods-use-this": 0 */

import Relay from 'react-relay';

export default class CreateHoursMutation extends Relay.Mutation {
    static fragments = {
        viewer: () => {
            return Relay.QL`
                fragment on User {
                    id
                }
            `;
        },
    }

    getMutation() {
        return Relay.QL`mutation { createHours }`;
    }

    getVariables() {
        return {
            projectId: this.props.project.id,
            date: this.props.date,
            start: this.props.start,
            end: this.props.end,
            duration: this.props.duration,
            comment: this.props.comment,
        };
    }

    getFatQuery() {
        return Relay.QL`
            fragment on CreateHoursPayload {
                newHoursEdge
                viewer
            }
        `;
    }

    getConfigs() {
        return [{
            type: 'RANGE_ADD',
            parentName: 'viewer',
            parentID: this.props.viewer.id,
            connectionName: 'hours',
            edgeName: 'newHoursEdge',
            rangeBehaviors: {
                '': 'prepend',
            },
        },
        {
            type: 'REQUIRED_CHILDREN',
            children: [Relay.QL`
                fragment on CreateHoursPayload {
                    errors {
                        key
                        msg
                    }
                }
            `],
        }];
    }
}
