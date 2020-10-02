import React from 'react';
import {BrowserRouter as Router, Route} from "react-router-dom";
import PresentationPage from './pages/presentation/presentation'
import AddStudentPage from './pages/add-student/add-student'
import ScoringPage from "./pages/scoring/scoring";
import HomePage from './pages/home/home'
import NavBar from './header/nav-bar/nav-bar'
import Footer from './footer/footer'

import './App.css';


function App() {
    return (
        <Router>
            <NavBar />
            <Route exact path="/" component={HomePage}/>
            <Route path="/presentation" component={PresentationPage}/>
            <Route path="/add-students" component={AddStudentPage} />
            <Route path="/scoring" component={() => <ScoringPage />} />
            {/*<Footer />*/}
        </Router>
    );
}

export default App;
