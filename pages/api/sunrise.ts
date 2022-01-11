import { TwitterApi } from 'twitter-api-v2';
import axios from 'axios';
import { TwitterMock } from '../../utils/twitterMock'
import { lightFormat } from 'date-fns'
import { ContentGenerator } from '../../utils/contentGenerator'

require('dotenv').config()

const generator = new ContentGenerator()

const de_client = new TwitterApi({
  appKey: process.env.DE_APPKEY,
  appSecret: process.env.DE_APPSECRET,
  accessToken: process.env.DE_ACCESSTOKEN,
  accessSecret: process.env.DE_ACCESSSECRET
});

const en_client = new TwitterApi({
  appKey: process.env.EN_APPKEY,
  appSecret: process.env.EN_APPSECRET,
  accessToken: process.env.EN_ACCESSTOKEN,
  accessSecret: process.env.EN_ACCESSSECRET
});

const mock_client = new TwitterMock();

const berlinLat = 52.5170365
const berlinLong = 13.3888599

async function post(payload, locale) {
  if (locale == "en") {
    return await en_client.v2.tweet(payload);
  } else if (locale == "de"){
    return await de_client.v2.tweet(payload);
  } else {
    mock_client.throwError = false;
    return await mock_client.tweet(payload);
  }
};

async function getToday() {
  const today = new Date()
  const urlDate = lightFormat(today, 'yyyy-MM-dd')  
  const url = `https://api.sunrise-sunset.org/json?lat=${berlinLat}&lng=${berlinLong}&formatted=0&date=${urlDate}`
  return await axios.get(url)
}

async function getYesterday() {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const urlDate = lightFormat(yesterday, 'yyyy-MM-dd')
  const url = `https://api.sunrise-sunset.org/json?lat=${berlinLat}&lng=${berlinLong}&formatted=0&date=${urlDate}`
  return await axios.get(url)
}

export default async function handler(req, res) {

  if (req.headers['x-api-token'] != process.env.SERVICE_ACCESSTOKEN) {
    return res.status(401).json('{error : "invalid token"}')
  }
  
  var fetchedYesterdayResponse
  var fetchedTodayResponse

  await getYesterday().then ( yesterdayResponse => {
    fetchedYesterdayResponse = yesterdayResponse
    return getToday()
  }).then( todayResponse => {
    fetchedTodayResponse = todayResponse
    return generator.parseSunriseData(fetchedTodayResponse, fetchedYesterdayResponse, "en", new Date())
  }).then( tweetContent => {
    return post(tweetContent, "en");
  }).then( (postResults) => {
    return generator.parseSunriseData(fetchedTodayResponse, fetchedYesterdayResponse, "de", new Date())
  }).then( tweetContent => {
    return post(tweetContent, "de");
  }).then( postResults => {
    res.status(200).json(postResults)
  }).catch( (err) => {
    res.status(500).json(err)
  })
}
