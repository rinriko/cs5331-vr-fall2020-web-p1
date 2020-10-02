import React from 'react'
import './singin.css'

class LoginPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            passCode : ''
        }
    }

    passCode = 'mlab'

    login = () => {
        if (this.state.passCode === this.passCode)
            this.props.success({name: 'Huyen'})
        else
            alert('Wrong passcode ¯\\_(ツ)_/¯')
        this.setState({passCode: ''})
    }

    render() {
        return (
            <form className={'login-page'}
            >
                <input type="password" placeholder={'code'} value={this.state.passCode} onChange={e => this.setState({
                    passCode: e.target.value
                })}/>
                <button onClick={this.login}>Submit</button>
            </form>
        );
    }
}

export default LoginPage
