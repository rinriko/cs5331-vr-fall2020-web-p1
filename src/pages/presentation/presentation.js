import React, {Fragment} from 'react'
import Modal from 'react-modal'
import Iframe from "react-iframe";


import {XYPlot,
    LineSeries,
    XAxis, YAxis,
    HorizontalGridLines,
    VerticalGridLines,
    MarkSeries,
    VerticalBarSeries,
    HorizontalBarSeries} from 'react-vis'
import {getStudents, postPresentingStudent, postPresentingTime} from "../../services/students";
import './presentation.css';
import LoginPage from "../signin/signin";
import {getAvgScoreByPresenterID} from "../../services/score";

class PresentationPage extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            currentUrl: 'www.google.com',
            students: [],
            student: null,
            nextStudent: null,
            modalOpen: false,
            countdown: 0,
            data: null,
            submissionCount: null,
            comments: null
        }
    }


    presentLength = 200;

    criteria = [
        {
            name: 'criteria_1',
            title: 'Effort',
            values: [
                1, 2, 3, 4, 5, 6, 7, 8, 9, 10
            ]
        },
        {
            name: 'criteria_2',
            title: 'Clarity',
            values: [
                1, 2, 3, 4, 5, 6, 7, 8, 9, 10
            ]
        },
        {
            name: 'criteria_3',
            title: 'Creativity',
            values: [
                1, 2, 3, 4, 5, 6, 7, 8, 9, 10
            ]
        },
        {
            name: 'criteria_4',
            title: 'Overall quality',
            values: [
                1, 2, 3, 4, 5, 6, 7, 8, 9, 10
            ]
        }
    ]

    componentWillUnmount() {
        // console.log("clearInterval at componentWillUnmount")
        this.setState({modalOpen: false, student: null})
        clearInterval(this.timerID);
        clearInterval(this.interval);
    }

    async getScores () {
        const scoreRaw = await getAvgScoreByPresenterID(this.state.student.id)

        // console.log(scoreRaw);
        let score = scoreRaw.avg;

        let submissionCount = scoreRaw.count;
        // let comments = scoreRaw.comments.reverse();
        let comments = scoreRaw.comments;
        // console.log('score ', score)

        await this.setState({
            student: {...this.state.student, score: score, timeleft: this.countdown},
            students: this.state.students.map(student => {
                if (student.id === score.presenter_id) {
                    student.score = score
                }
                return student
            })
        });

        if (score) {
            const keys = Object.keys(score).filter(d => d.indexOf("criteria") >= 0);

            let data = keys.map((d,i) => {
                return {
                    y: i,
                    x: score[d]
                }
            })

            // console.log(data);
            await this.setState({data, submissionCount, comments});
        } else {
            this.setState({
                data: null,
                submissionCount: null,
                comments: null
            })
        }
    }


    async startHere(index) {
        let idx = index - 1;

        // get from backend
        await this.changeURL(idx)
        idx++;

        this.interval = setInterval(async () => {
            await this.changeURL(idx);
            idx++;
        }, this.presentLength*1000)

        this.timerID = setInterval(
            () => {
                this.setState((prevState) => {
                    return { countdown: prevState.countdown - 1}
                });
                 postPresentingTime({startTime: this.state.countdown})
                if (this.state.student) {
                    this.getScores()
                }
            },
            1000
        );
    }

    closeModal = () => {
        this.setState({modalOpen: false, student: null})
        postPresentingStudent({})
        clearInterval(this.interval)
        clearInterval(this.timerID)
        // console.log("clearInterval(this.timerID) at closeModal")
    }

    changeURL = async (idx) => {
        await postPresentingStudent({});
        if (idx === this.state.students.length) {
            // reach end of list
            this.setState({
                modalOpen: false,
                student: null,
                currentUrl: '',
            })
            clearInterval(this.interval)
            clearInterval(this.timerID)
            // console.log("clearInterval at reachedLength")
            // alert('Done')
            return
        }

        this.setState({
            modalOpen: false,
            student: this.state.students[idx],
            currentUrl: this.state.students[idx].url,
            countdown: this.presentLength,
            nextStudent: this.state.students[idx + 1],
        })

        this.setState({
            modalOpen: true
        });

        this.startTime = new Date;
        // console.log(this.startTime);

        if (idx !== this.state.students.length){
            await postPresentingStudent(this.state.students[idx])
            // await postPresentingTime({startTime: this.startTime})
        }
    };

    render() {
        const content = !this.state.user ? <LoginPage
            success={async (user) => {
                this.setState({user})
                const students = await getStudents(); // get from back end
                students.forEach(function(s){s.id = s.id||s.orderid})
                await this.setState({students});
            }}
        /> :
        // return(
            <div className={"contentOverflow"}>
                <div className="header m-3">
                    <h2 className={"display-4 pb-3"}>Presentation list</h2>
                    <table className="table table-striped table-hover">
                        <thead className="thead-grey">
                        <tr>
                            <th scope="col">ID</th>
                            <th scope="col">Name</th>
                            <th scope="col">Image</th>
                            {/*<th scope="col">Sketch</th>*/}
                            <th scope="col">Screenshot</th>
                            <th scope="col">Presentation</th>
                            <th scope="col">GitHub</th>
                            {/*<th scope="col">Score</th>*/}
                            <th scope="col"></th>
                        </tr>
                        </thead>
                        <tbody>
                        {this.state.students.map(student => (
                            <tr key={student.id}>
                                <td scope="row">{student.id}</td>
                                <td className={"nameCell"}>{student.name}</td>
                                <td><img alt={student.name} style={{width: 120}} src={student.image.replace('open?id','uc?export=view&id').replace('watch?','embed/')}/></td>
                                {/*<td><img alt={"group " + student.id} style={{height: 100}} src={student.sketch.replace('open?id','export=view?id')}/></td>*/}
                                <td><img alt={"Presentation " + student.id} style={{height: 100}} src={student.screenshot.replace('open?id','uc?export=view&id')}/></td>
                                <td className={"urlCell"}><a href={student.url} target="_blank">{student.url}</a></td>
                                <td className={"urlCell"}><a href={student.githubURL} target="_blank">{student.githubURL}</a></td>
                                <td>
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        onClick={() => {
                                            return this.startHere(student.orderid)
                                        }}
                                    >
                                        Start
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                    <Modal
                        isOpen={this.state.modalOpen}
                        ariaHideApp={false}
                        style={{
                            content: {
                                padding: '10px',
                                backgroundColor: '#e9e9e9',
                                height: (window.innerHeight) + "px",
                                borderStyle: 'solid',
                                borderWidth: '3px',
                                borderColor: '#4f4f4f',
                                top: '0px',
                                left: '0px',
                                right: '0px',
                                // marginBottom: '10px',
                            }
                        }}
                    >
                        <div>
                            <table className={"table table-custom"}>
                                <tbody>
                                <tr>
                                    <td rowSpan={2}><Iframe
                                        url={this.state.currentUrl}
                                        width="100%"
                                        height={(window.innerHeight-60) + "px"}
                                        className={'iframe'}
                                    /></td>

                                    <td style={{width: '276px'}}>
                                        <button
                                            onClick={this.closeModal}
                                            className={'float-right btn btn-danger btn-circle'}>
                                            <span style={{fontSize: "25px", padding: "0"}}>&times;</span></button>
                                        <h4>{this.state.student ? "Presentation #" + this.state.student.id + " " : ""}</h4>
                                        <h6>{this.state.student ? "" + this.state.student.name + " " : ""}</h6>
                                        <div><img alt={this.state.student ?this.state.student.name:""} style={{height: 140}} src={this.state.student ?this.state.student.image:""}/></div>
                                        <div>{this.state.countdown > 0 ?
                                            <div><h4 className={"h4"}>{"Time left: \u00A0"}</h4>
                                                <h1 className={"h1"}>{this.state.countdown}</h1>
                                                <h4 className={"h4"}>{"s"}</h4>
                                            </div> :
                                            <h1 className={"h1"}>{"EXPRIRED"}</h1>}
                                        </div>

                                        {
                                            this.state.student && this.state.student.score ?
                                                <div>
                                                <XYPlot   margin={{left: 105}}
                                                          height={150} width={250}
                                                          xDomain={[0, 10]}
                                                >
                                                    <HorizontalGridLines style={{stroke: '#8ab1b4'}}/>
                                                    <VerticalGridLines style={{stroke: '#8ab1b4'}}/>
                                                    <XAxis/>

                                                    <YAxis tickSize={20} left={20}
                                                           tickFormat={v => this.criteria[v].title} tickTotal={5}
                                                           style={{
                                                               // line: {stroke: '#ADDDE1'},
                                                               // ticks: {stroke: '#ADDDE1'},
                                                               text: {stroke: 'none', fill: '#000000', fontSize: '1rem'}}}
                                                        />
                                                    <HorizontalBarSeries
                                                        data={this.state.data} />
                                                </XYPlot>
                                                    <div style={{"border-top":"1px solid #c2c2c2"}}>
                                                        <div style={{display: "inline"}}>{this.state.submissionCount}</div>
                                                        <div style={{display: "inline"}}>{" evaluations"}</div>
                                                        <div>
                                                            {!this.state.comments && <div>Loading...</div>}
                                                            {this.state.comments && this.state.comments.length > 0 ?
                                                            <div className={"scroll"}>
                                                                {
                                                                    this.state.comments.map((comment, index) => <div className={"commentLine"} key={comment.id}>{
                                                                        (index+1) + ". #" +comment.user_id+" :"+ comment.comment}</div>)
                                                                }
                                                            </div>
                                                            :
                                                            <div>No comments yet</div>}
                                                        </div>
                                                    </div>
                                                </div>: <div>
                                                    <p>No scores recorded</p>
                                                </div>
                                        }

                                    </td>
                                </tr>

                                <tr>
                                    <td>
                                        <div>{this.state.nextStudent ?
                                            <div>
                                                <div className={"mb-1"} style={{height: "40px"}}>
                                                    <div style={{float: "left"}}>{" Presentation #" + this.state.nextStudent.id + "  "}</div>
                                                    <button
                                                    type="button"
                                                    className="btn btn-primary"
                                                    style={{float: "right"}}
                                                    onClick={() => {
                                                        this.setState({student: null})
                                                        postPresentingStudent({})
                                                        clearInterval(this.interval)
                                                        clearInterval(this.timerID)
                                                        return this.startHere(this.state.nextStudent.orderid)
                                                    }}
                                                >
                                                    Next
                                                </button></div>
                                                <div><h5>{this.state.nextStudent.name}</h5>
                                                    <img alt={this.state.nextStudent.name} style={{height: 140}} src={this.state.nextStudent.image}/></div>
                                                <div className={"pt-2"}>{"\n\n"}</div>

                                            </div> : "Last student ‾\\_(ツ)_/‾\n"}</div>
                                    </td>
                                </tr>
                                </tbody>
                            </table>

                            <div>

                            </div>

                        </div>


                    </Modal>
                </div>
            </div>
            return (
                <Fragment>
                    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
                        {content}
                    </div>
                </Fragment>
        )
    }
}

export default PresentationPage
