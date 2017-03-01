import React from 'react';
import Relay from 'react-relay';

class Landing extends React.Component {
    static propTypes = {
        site: React.PropTypes.object.isRequired,
    }
    render() {
        const { site } = this.props;

        const style = {
            header: {
                fontWeight: 300,
                color: '#202020',
                fontSize: '15px',
                lineHeight: '21px',
                height: '50px',
                background: 'white',
                boxShadow: 'inset 0 -1px 0 0 rgba(0,0,0,.1)',
                zIndex: 10,
            },
            section: {
                maxWidth: 1080,
                margin: '0 auto',
                padding: '0 20px',
            },
            home: {
                float: 'left',
                fontSize: '18px',
                textDecoration: 'none',
                paddingRight: '1em',
                lineHeight: '50px',
                textTransform: 'uppercase',
                color: '#202020',
            },
            hero: {
                position: 'relative',
                background: '#171E26',
            },
            heroheader: {
                background: 'linear-gradient(rgba(23, 30, 38, 0.8), rgba(23, 30, 38, 0))',
                boxShadow: 'none',
                display: 'block',
            },
            intro: {
                margin: '0 auto',
                padding: '0 20px',
                clear: 'both',
                display: 'flex',
                maxWidth: '1070px',
                flexDirection: 'column',
            },
        };

        return (
            <div id="landingpage">
                <header style={style.header}>
                    <section style={style.section}>
                        <a href="#landingpage" style={style.home}>{site.name}</a>
                        <nav>
                            <a href="#test">Test</a>
                        </nav>
                    </section>
                </header>

                <div className="hero">
                    <div className="abs">
                        <header aria-hidden="true" style={style.heroheader}>
                            <nav>
                                <a href="#test">Test</a>
                            </nav>
                        </header>
                        <section className="intro" style={style.into}>
                            Intro something here
                        </section>
                    </div>
                </div>

                <section className="lead" style={style.section}>
                    <h1>Derp derp</h1>
                    <p>Some crap</p>
                </section>
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
