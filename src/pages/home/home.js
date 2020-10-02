import React from 'react'
import Iframe from 'react-iframe'
import './home.css';

class HomePage extends React.Component {
    render() {
        return (
            <div>
                <div className="header">
                    <Iframe url="https://idatavisualizationlab.github.io/CS5331-VirtualReality-Fall2020/"
                            width="80%"
                            height="1200px"
                            margin-top="30px"
                            display="initial"
                            position="relative"
                    />
                </div>
            </div>
        );
    }
}

export default HomePage
