import React, { Component, Fragment } from 'react'
import Modal from 'react-modal'

import { editStudent, getStudents, postStudent } from '../../services/students'
import LoginPage from '../signin/signin'
import './add-student.css'

class AddStudentPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            students: [],
            id: '',
            name: '',
            url: '',
            image: '',
            modalOpen: false,
            student: null,
            user: null
        }
    }

    reset() {
        getStudents().then(students => {
            this.setState({ students })
        });
        this.setState({ name: '', url: '', image: '' })
    }

    componentDidMount() {
        this.reset()
    }

    submitData = async () => {
        await postStudent({
            id: this.state.students.length + 1,
            name: this.state.name,
            url: this.state.url || "https://en.wikipedia.org/wiki/Special:Random",
            image: this.state.image || "https://upload.wikimedia.org/wikipedia/commons/2/2c/Rotating_earth_%28large%29.gif",
        });
        this.reset()
    }

    submitEdit = async () => {
        const student = this.state.student
        delete student._id
        const res = await editStudent(student)
        this.setState({ modalOpen: false, student: null })
        this.reset()
    }

    editStudent = (student) => {
        this.setState({ modalOpen: true, student })
    };

    render() {
        const content = !this.state.user ? <LoginPage
            success={(user) => this.setState({ user })}
        /> : <div>
            <div className="header">
                <h3>Add Student Info</h3>

                <div className="field">
                    <label htmlFor='name'>Name: </label>
                    <input id='name' name='name'
                        value={this.state.name} type="text"
                        onChange={e => this.setState({ name: e.target.value })} />
                    <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>

                    <label htmlFor='image'>Image Link: </label>
                    <input id='image' name='image'
                        value={this.state.image}
                        type="text" onChange={e => this.setState({ image: e.target.value })} />
                    <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>

                    <label htmlFor="url">URL: </label>
                    <input id='url' name='url'
                        value={this.state.url} type="text"
                        onChange={e => this.setState({ url: e.target.value })} />
                    <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>
                    <button type='submit' onClick={this.submitData}>Submit</button>
                </div>

                <div>
                    <table className="table">
                        <thead>
                            <tr>
                                <th scope="col">id</th>
                                <th scope="col">Image</th>
                                <th scope="col">Name</th>
                                <th scope="col">URL</th>
                                <th scope="col">Ban Score</th>
                                <th scope="col">Thay Score</th>
                                <th scope="col">Contribution</th>
                                <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.students.map(student => (
                                <tr>
                                    <th scope="row">{student.id}</th>
                                    <td><img alt={student.name} style={{ height: 100 }} src={student.image} /></td>
                                    <td>{student.name}</td>
                                    <td>{student.url}</td>
                                    <td>{JSON.stringify(student.score)}</td>
                                    <td>{student.thay_score}</td>
                                    <td>{student.num_scored}</td>
                                    <td>
                                        <button onClick={() => this.editStudent(student)}
                                            type={'button'}
                                            className={'btn btn-sm' +
                                                ' btn-outline-dark'}>Edit
                                        </button></td>
                                </tr>
                            ))}
                        </tbody>

                    </table>
                </div>
                <Modal
                    isOpen={this.state.modalOpen}
                >
                    {this.state.student && <div className="field">
                        <label htmlFor='name'>Name: </label>
                        <input id='name' name='name'
                            value={this.state.student.name} type="text"
                            onChange={e => this.setState({ student: { ...this.state.student, name: e.target.value } })} />
                        <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>

                        <label htmlFor='image'>Image Link: </label>
                        <input id='image' name='image'
                            value={this.state.student.image}
                            type="text" onChange={e => this.setState({ student: { ...this.state.student, image: e.target.value } })} />
                        <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>

                        <label htmlFor="url">URL: </label>
                        <input id='url' name='url'
                            value={this.state.student.url} type="text"
                            onChange={e => this.setState({ student: { ...this.state.student, url: e.target.value } })} />
                        <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>
                        <label htmlFor="url">Thay score: </label>
                        <input id='url' name='thay_score'
                            value={this.state.student.thay_score} type="number"
                            onChange={e => this.setState({ student: { ...this.state.student, thay_score: e.target.value } })} />
                        <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>
                        <button type='submit' onClick={this.submitEdit}>Submit</button>
                    </div>
                    }
                    <button
                        onClick={() => this.setState({ modalOpen: false, student: null })}
                    >Cancel</button>
                </Modal>
            </div>
        </div>

        return (
            <Fragment>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {content}
                </div>
            </Fragment>
        )
    }


}

export default AddStudentPage
