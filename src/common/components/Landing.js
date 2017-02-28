import React from 'react';
import Container from './Container';

class Landing extends React.Component {
    render() {
        return (
            <Container className="wrapper">
                <h1>Rullebane</h1>
                <a href="/auth/google">Login</a>
            </Container>
        );
    }
}

export default Landing;
