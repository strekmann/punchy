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
                            <a href="#easy">Enkelt</a>
                            <a href="#rapport">Oversiktlig</a>
                            <a href="#open">Åpent</a>
                            <a href="/auth/google">Logg inn</a>
                        </nav>
                    </section>
                </header>

                <div className="hero">
                    <div className="abs">
                        <header aria-hidden="true">
                            <section>
                                <nav>
                                    <a href="#easy">Enkelt</a>
                                    <a href="#rapport">Oversiktlig</a>
                                    <a href="#open">Åpent</a>
                                </nav>
                            </section>
                        </header>
                        <section className="intro">
                            <div>
                                <h1 style={{ fontSize: '58px' }}>Punchy</h1>
                            </div>
                            <div>
                                <h2 style={{ fontSize: '16px', textTransform: 'uppercase' }}>Timeregistrering for vanlige mennesker</h2>
                                <p style={{paddingTop: '4em'}}><a className="loginbtn" href="/auth/google">Logg inn</a></p>
                            </div>
                        </section>
                    </div>
                </div>

                <section className="block">
                    <h1 id="easy">Enkelt</h1>
                    <p>
                        Med fokus på enkelhet vil Punchy gi brukere en bedre timeføringshverdag.
                        Tilrettelagt for enkel sanntidsføring og for føring i tabellformat vil
                        brukere selv kunne velge hvordan de mest effektivt fører sine timer.
                    </p>
                </section>

                <div className="grayWash">
                    <section className="block">
                        <h1 id="rapport">Oversiktlig</h1>
                        <p>
                            Med enkle og fine oversikter vil brukere samt ledere enkelt kunne ta ut
                            rapporter på tid brukt på prosjekter, overtidstimer og flexi-tid.
                            Dette gir brukere god oversikt over sine timer og ledere informasjon til
                            budsjettering og fakturering.
                        </p>
                    </section>
                </div>

                <section className="block">
                    <h1 id="open">Åpent</h1>
                    <p>
                        Kildekoden er åpen og fritt tilgjengelig slik at du selv kan se hva som skjer
                        og utvikle egne utvidelser.
                    </p>
                </section>

                <footer>
                    <section>
                        Strekmann &copy; 2017
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
