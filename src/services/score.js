import {postData, getData} from './students'
import config from '../config'

const uri = config.uri

const postScore = (score = {}) =>{
    return postData(`${uri}/scores`, score).then(res => res)
}

const getScores = () => {
    return getData(`${uri}/scores`).then(res => res.json())
}

const getAvgScoreByPresenterID = id => {
    return getData(`${uri}/scores/` + id).then(res => res)
}

export {
    postScore,
    getScores,
    getAvgScoreByPresenterID
}