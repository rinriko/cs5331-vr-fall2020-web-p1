import React, {Fragment} from 'react'
import Iframe from "react-iframe";
import {getPresentingStudent, getStudents, getPresentingTime} from "../../services/students";
import {postScore} from "../../services/score";

import './scoring.css';

class ScoringPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            students: [],
            presenting_student: null,
            id: '',
            score: {},
            comment: '',
            timeleft: null
        }
    }

    submitLimit = 140;

    criteria = [
        {
            name: 'criteria_1',
            title: '1. How do you rate the effort of this work?',
            values: [
                1, 2, 3, 4, 5, 6, 7, 8, 9, 10
            ]
        },
        {
            name: 'criteria_2',
            title: '2. How innovative and transformative is the game idea?',
            values: [
                1, 2, 3, 4, 5, 6, 7, 8, 9, 10
            ]
        },
        {
            name: 'criteria_3',
            title: '3. How do you rate the clarity of this presentation on the scale from 1 (not clear at all) to 10 (the presentation is clear)?',
            values: [
                1, 2, 3, 4, 5, 6, 7, 8, 9, 10
            ]
        }
    ]

    async componentDidMount() {
        const students = await getStudents()
        await this.setState({students: students})
        await this.getPresentingStudent()
        this.interval = setInterval(this.getPresentingStudent, 1000)
    }

    componentWillUnmount() {
        clearInterval(this.interval)
    }

    getPresentingStudent = async () => {
        const presenting_student = await getPresentingStudent();
        const startTime = await getPresentingTime();
        let updatevalue = {
            presenting_student: presenting_student,
            timeleft: startTime.startTime,
        }
        if (this.state.presenting_student&&(this.state.presenting_student._id!==presenting_student._id)){
            let score = this.state.score;
            for (let c of this.criteria) {
                score[c.name] = null;
            }
            document.querySelectorAll('.form-check-input').forEach(el=>{
                el.checked = false;
            })
            updatevalue.score = score;
        }
        await this.setState(updatevalue)
        // console.log(this.state.timeleft);
    }

    setUser = async () => {
        if (this.state.id.length === 0 || parseInt(this.state.id) < 1 || parseInt(this.state.id) > 90) {
            // should be 82
            alert('Wrong ID')
        } else {
            if (this.state.timeleft >= this.submitLimit)
            {
                alert('Only allow submission after 100sec!')
                return
            }
            for (let c of this.criteria) {
                if (!this.state.score[c.name]) {
                    alert(c.name + ' missing')
                    return
                }
            }

            const payload = {
                user_id: (this.state.id),
                presenter_id: this.state.presenting_student.id,
                comment: this.state.comment,
                ...this.state.score
            }
            // console.log(JSON.stringify(payload));
            const res = await postScore(payload)
            alert('Submited score for group ' + this.state.presenting_student.id)
        }
    }

    render() {
        const content = (this.state.presenting_student && this.state.presenting_student.id) ?
            <div style={{"backgroundColor": "#ddd"}}>
                <div className={"container"}>
                    <div className={"row"} style={{"position": 'relative'}}>
                        <h3>{"Current Group: #" + this.state.presenting_student.id}</h3>
                        <div style={{"position": 'absolute', "right": 0}}>
                            {(this.state.timeleft > 2)?
                                <div>
                                    <h4 className={"h4"}>{"Time left: "}</h4>
                                    <h3 className={"h1"}>{this.state.timeleft - 2}</h3>
                                    <h4 className={"h4"}>{"s"}</h4>
                                </div> : <div>
                                    <h4 className={"h4"}>{"Time left: "}</h4>
                                    <h3 className={"h1"}>{"--"}</h3>
                                </div> }
                        </div>
                    </div>
                    <div className="row aspect-video">
                        <Iframe
                            width={'1280'}
                            height={'720'}
                            url={this.state.presenting_student.url}
                        />
                        {/*<h3 className={"inline"}>{"Time left: " + (this.state.timeleft? (this.state.timeleft - 1) + "s\n" : "--\n")}</h3>*/}
                        {/*<div className={"block"}>{"\n"}</div>*/}
                    </div>
                    <div className={"row mt-2"}>
                        <div>
                            <div className="form-group row">
                                {/*<h3 className={"block"}>{"Time left: " + (this.state.timeleft? (this.state.timeleft - 1) + "s\n" : "--\n")}</h3>*/}
                                <div className={"block"}>{"\n"}</div>
                                <label htmlFor="colFormLabel" className="col-form-label">Your class ID</label>
                                <div className="col-sm-8">
                                    <input type="number" className="form-control"
                                           value={this.state.id}
                                           id="colFormLabel"
                                           placeholder="ID"
                                           onChange={e => this.setState({id: e.target.value})}
                                           required/>
                                </div>
                            </div>
                            {/*checkboxes*/}
                            <fieldset className="form-group">
                                {this.criteria.map(c => <div key={c.name} className="row mt-4">
                                    <legend className="col-form-label col-lg-10 pt-0">{c.title}</legend>
                                    <div className="col-sm-12">
                                        {c.values.map(v => <div key={v} className="form-check form-check-inline mr-4">
                                            <input className="form-check-input"
                                                   type="radio" name={c.name}
                                                   id={c.name+v} value={v}
                                                   style={{padding: '1rem'}}
                                                   onChange={async () => {
                                                       await this.setState({score: {...this.state.score, [c.name]: v}})
                                            }}/>
                                            <label className="form-check-label" htmlFor={c.name+v}>{v}</label>
                                        </div>)}
                                    </div>
                                </div>)}
                            </fieldset>
                            <div className="form-group row mt-2">
                                <label htmlFor="colFormLabel" className="col-sm-10 col-form-label">Any comment/question</label>
                                <div className="col-sm-10">
                                    <textarea
                                        className="form-control"
                                        value={this.state.comment}
                                        id="formControlTextarea"
                                        rows="3"
                                        onChange={e => this.setState({comment: e.target.value})}
                                    />
                                </div>
                            </div>
                            <button className="btn btn-success" style={{marginBottom: "50px"}}
                                    onClick={this.setUser}>Submit
                            </button>
                        </div>
                    </div>
                </div>
            </div>:
            <div>
                <p>No presentation.</p>
            </div>

        return (
            <Fragment>
                {content}
            </Fragment>
        )
    }
}

export default ScoringPage
