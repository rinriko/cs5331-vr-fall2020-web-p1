import React, {Component} from 'react';
import {Link} from 'react-router-dom';

class NavBar extends Component {
    render() {
        return (
            <header>
                <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                    <Link className="navbar-brand" to="/">Student Database</Link>
                    {/* ¯\_(ツ)_/¯*/}
                    <button className="navbar-toggler" type="button" data-toggle="collapse"
                            data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent"
                            aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse" id="navbarSupportedContent">
                        <ul className="navbar-nav mr-auto">
                            <li className="nav-item active" id="homeTab">
                                <Link className="nav-link" to="/">Home <span className="sr-only">(current)</span></Link>
                            </li>
                            <li className="nav-item" id="editTab">
                                <Link className="nav-link" to="/presentation">Presentation</Link>
                            </li>

                            <li className="nav-item" id="addTab">
                                <Link className="nav-link" to="/scoring">Scoring</Link>
                            </li>

                            <li className="nav-item" id="addTab">
                                <Link className="nav-link" to="/add-students">Students</Link>
                            </li>
                        </ul>
                    </div>
                </nav>
            </header>
        )
    }
}

export default NavBar;