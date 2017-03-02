import React from 'react';
import Relay from 'react-relay';

class Landing extends React.Component {
    static propTypes = {
        site: React.PropTypes.object.isRequired,
    }
    render() {
        const { site } = this.props;
        return (
            <div id="landingpage">
                <header>
                    <section>
                        <a className="nav-home" href="#landingpage">{site.name}</a>
                        <nav>
                            <a href="#test">Top header</a>
                        </nav>
                    </section>
                </header>

                <div className="hero">
                    <div className="abs">
                        <header aria-hidden="true">
                            <section>
                                <nav>
                                    <a href="#test">Test</a>
                                </nav>
                            </section>
                        </header>
                        <section className="intro">
                            <div>
                                <h1 style={{ fontSize: '58px' }}>Punchy</h1>
                            </div>
                            <div>
                                <h2 style={{ fontSize: '16px', textTransform: 'uppercase' }}>Timeregistrering for vanlige mennesker</h2>
                            </div>
                        </section>
                    </div>
                </div>

                <section className="lead">
                    <h1>Derp derp</h1>
                    <p>Some crap</p>
                </section>

                <div className="grayWash">
                    <section className="point1">
                        <h1>Herp herp</h1>
                        <p>Some moar crap</p>
                    </section>
                </div>

                <footer>
                    <section>
                        some footer stuff
                    </section>
                </footer>
            </div>
        );
    }
}

export default Relay.createContainer(Landing, {
    fragments: {
        site: () => {
            return Relay.QL`
            fragment on Site {
                name
            }`;
        },
    },
});
