import React, {Fragment} from 'react'
import Modal from 'react-modal'
import Iframe from "react-iframe";
import * as d3 from 'd3';


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
            studentList: {},
            student: null,
            nextStudent: null,
            modalOpen: false,
            countdown: 0,
            data: null,
            submissionCount: null,
            comments: null,
            simulation:d3.forceSimulation(),
        }
    }


    presentLength = 360;
    presentOpensubmission = 180;
    presentWarning = 60;

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
            title: 'Innovative',
            values: [
                1, 2, 3, 4, 5, 6, 7, 8, 9, 10
            ]
        },
        {
            name: 'criteria_3',
            title: 'Teamwork',
            values: [
                1, 2, 3, 4, 5, 6, 7, 8, 9, 10
            ]
        },
        {
            name: 'criteria_4',
            title: 'Quality',
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
            // let data = keys.map((d,i) => {
            //     return {
            //         y: this.criteria[i].title,
            //         x: score[d]
            //     }
            // }).reverse();
            let data = this.state.data;
            if (data ===null)
                data = [];
            let newData = [];
            keys.forEach((d,i) => {
                scoreRaw.data[d].forEach((e,ei)=>{
                    newData.push({
                        id:ei,
                        level:e.level,
                        value:e.value,
                        key:this.criteria[i].title
                    })
                });
            });
            let reheat= false;
            data.forEach(d=>d.enable=false);
            newData.forEach(d=>{
                const oldel = data.find(e=>(e.key+e.id)===(d.key+d.id));
                if (!oldel){
                    reheat = true;
                    d.enable = true;
                    data.push(d);
                }else
                    oldel.enable = true;
            });
            let oldlength = data.length;
            data= data.filter(d=>d.enable);
            if (oldlength!==data.length)
                reheat = true;
            this.creatScoreChart(data,reheat);

            await this.setState({data, submissionCount, comments});
        } else {
            this.setState({
                data: null,
                submissionCount: null,
                comments: null
            })
        }
    }

    creatScoreChart(data,reheat) {
        let width = 250;
        let height = 200;
        let margin = {top:10,left:0,right:10,bottom:20};
        let h = height-margin.top-margin.bottom;
        let w = width-margin.left-margin.right;
        let radius = 3;
        let padding = 0.5;
        let y = d3.scalePoint().domain(data.map(d=>d.key))
            .range([0,h]).padding(0.5);
        let x = d3.scaleLinear().domain([0,10]).range([0,w]);
        var color = d3.scaleOrdinal(d3.schemeCategory10).domain([0,1,3]);
        let svg = d3.select(this.refs.scorePlot).select('svg')
            .style('overflow','visible')
            .attr('width',width)
            .attr('height',height);
        let g = svg.select('g.content').attr('transform',`translate(${margin.left},${margin.top})`);
        let axisx = g.select('g.axisx');
        if(axisx.empty()){
            axisx = g.append('g').attr('class','axisx');
        }
        axisx.attr('transform',`translate(0,${h})`).call(d3.axisBottom(x).ticks(5));
        axisx.select('.domain').remove();
        axisx.selectAll('line').attr('y2',-h);
        axisx.selectAll('text').attr('dy','0.5em');
        let axisy = g.select('g.axisy');
        if(axisy.empty()){
            axisy = g.append('g').attr('class','axisy');
        }
        axisy.call(d3.axisRight(y));
        axisy.select('.domain').remove();
        axisy.selectAll('line').attr('x2',w);
        axisy.selectAll('text').attr('dy',-2);
        axisy.selectAll('text').attr('x',0);
        let node=g.selectAll('circle').data(data,d=>d.key+d.id)
            .join("circle")
            .attr("cx", d => d.x===undefined?0:d.x)
            .attr("cy", d => d.y==undefined? y(d.key):d.y)
            .attr('fill',d=>color(getCategoty(d.level)))
            .attr('stroke','#fff')
            .attr('stroke-opacity',0.5)
            .attr('opacity',0.9)
            .attr("r", radius);
        if (reheat){
            let simulation = this.state.simulation
                .force("x", d3.forceX().strength(0.3).x( function(d){ return x(d.value) } ))
                .force("y", d3.forceY().strength(0.3).y( function(d){ return y(d.key) } ))
                .force("charge", d3.forceManyBody().strength(-0.1)) // Nodes are attracted one each other of value is > 0
                .force("collide", d3.forceCollide().radius(radius)) // Force that avoids circle overlapping

            simulation
                .nodes(data)
                .on("tick", function(d){
                    node
                        .attr("cx", function(d){ return d.x; })
                        .attr("cy", function(d){ return d.y; })
                }).restart().alpha(0.25);
            this.setState(simulation)
        }
        function getCategoty(str){
            if (str==="PhD")
                return 3;
            else if (new RegExp(/MSSE/g).test(str))
                return 2;
            else if (new RegExp(/MSCS/g).test(str))
                return 1;
            else
                return 0;
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
                students.forEach(function(s){s.members = s.members.split(',')})
                students.sort((a,b)=>a.orderid-b.orderid);
                const studentList_arr = await d3.json("https://cs5331-vr-fall202.herokuapp.com/students");
                const studentList = {};
                studentList_arr.forEach(d=>{
                    studentList[d.id] = d;
                })
                await this.setState({studentList});
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
                            <th scope="col">Group</th>
                            <th scope="col">Name</th>
                            {/*<th scope="col">Image</th>*/}
                            <th scope="col">Abstract</th>
                            {/*<th scope="col">Sketch</th>*/}
                            <th scope="col">Screenshot</th>
                            <th scope="col">Presentation</th>
                            <th scope="col">Video</th>
                            <th scope="col">GitHub</th>
                            {/*<th scope="col">Score</th>*/}
                            <th scope="col"></th>
                        </tr>
                        </thead>
                        <tbody>
                        {this.state.students.map(student => (
                            <tr key={student.id}>
                                <td scope="row">{student.id}</td>
                                <td className={"avatarCell"}>{student.name}<br></br>{student.members.map(id=><img alt={'#'+id} style={{width: 30}} src={'https://github.com/idatavisualizationlab/CS5331-VirtualReality-Fall2020/blob/master/photos/'+this.state.studentList[id]['Photoname']+'?raw=true'}/>)}</td>
                                {/*<td><img alt={student.name} style={{width: 120}} src={student.image.replace('open?id','uc?export=view&id').replace('watch?','embed/')}/></td>*/}
                                <td style={{'textAlign':'left'}}><h6>{student.title}</h6>{student.abstract}</td>
                                {/*<td><img alt={"group " + student.id} style={{height: 100}} src={student.sketch.replace('open?id','export=view?id')}/></td>*/}
                                <td><img alt={"Group " + student.id} style={{height: 100}} src={student.screenshot.replace('open?id','uc?export=view&id')}/></td>
                                <td className={"urlCell"}><a href={student.url} target="_blank">{student.url}</a></td>
                                <td className={"urlCell"}><a href={student.Video} target="_blank">{student.Video}</a></td>
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
                                        <h4>{this.state.student ? "Group #" + this.state.student.id + " " : ""}</h4>
                                        <h6>{this.state.student ? "" + this.state.student.name + " " : ""}</h6>
                                        {/*<div><img alt={this.state.student ?this.state.student.name:""} style={{height: 140}} src={this.state.student ?this.state.student.image:""}/></div>*/}
                                        <div className={"avatarCell"}>{(this.state.student&&this.state.student.members) ?(this.state.student.members.map(id=><img alt={'#'+id} style={{width: 30}} src={'https://github.com/idatavisualizationlab/CS5331-VirtualReality-Fall2020/blob/master/photos/'+this.state.studentList[id]['Photoname']+'?raw=true'}/>)):''}</div>
                                        <div>{this.state.countdown > 0 ?
                                            <div><h4 className={"h4"}>{"Time left: \u00A0"}</h4>
                                                <h1 style={this.state.countdown<=this.presentWarning && (this.state.countdown%2)?{color:'red'}:{color:'unset'}} className={"h1"}>{this.state.countdown}</h1>
                                                <h4 className={"h4"}>{"s"}</h4>
                                            </div> :
                                            <h1 className={"h1"}>{"EXPRIRED"}</h1>}
                                        </div>

                                        {
                                            this.state.student && this.state.student.score ?
                                                <div>
                                                    <div ref="scorePlot">
                                                        <svg><g className={'content'}></g></svg>
                                                    </div>
                                                    <div>
                                                        <div style={{display: "inline"}}>{this.state.submissionCount}</div>
                                                        <div style={{display: "inline"}}>{" evaluations"}</div>
                                                        <div style={{"border-top":"1px solid #c2c2c2"}}>
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
                                                    {this.state.countdown<=this.presentOpensubmission?
                                                        <p style={{color:'#146900'}}>Receiving Comments...</p>:
                                                    <p>No scores recorded</p>}
                                                </div>
                                        }

                                    </td>
                                </tr>

                                <tr>
                                    <td>
                                        <div>{this.state.nextStudent ?
                                            <div>
                                                <div className={"mb-1"} style={{height: "40px"}}>
                                                    <h4 style={{float: "left"}}>{" Group #" + this.state.nextStudent.id + "  "}</h4>
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
                                                <div><h6>{this.state.nextStudent.name}</h6>
                                                    {/*<img alt={this.state.nextStudent.name} style={{height: 140}} src={this.state.nextStudent.image}/>*/}
                                                    <div className={"avatarCell"}>{this.state.nextStudent ?(this.state.nextStudent.members.map(id=><img alt={'#'+id} style={{width: 30}} src={'https://github.com/idatavisualizationlab/CS5331-VirtualReality-Fall2020/blob/master/photos/'+this.state.studentList[id]['Photoname']+'?raw=true'}/>)):''}</div>
                                                </div>
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
