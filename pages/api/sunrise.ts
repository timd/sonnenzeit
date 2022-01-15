import { TwitterApi } from 'twitter-api-v2';
import axios from 'axios';
import { TwitterMock } from '../../utils/twitterMock'
import { lightFormat } from 'date-fns'
import { ContentGenerator } from '../../utils/contentGenerator'
import { locationDb, checkCity, getLatLong, Location } from  '../../utils/latlong'

require('dotenv').config()

const generator = new ContentGenerator()

export const SUNRISE_BASE_URL = "https://api.sunrise-sunset.org";

const mockTwitter = true;

const berlinLat = 52.5170365
const berlinLong = 13.3888599

async function post(payload, city: Location) {

  //const client: TwitterApi

  switch (city.twitter) {
    case "sonnezeitberlin": {
      break;
    }
    case "berlindaylight": {
      break;
    }
    case "daylightinnyc": {
      break;
    }
    case "daylightinsf": {
      break;
    }
    case "sonnezeitberlin": {
      break;
    }
    default:
      return
  }

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
  
  if (mockTwitter) {
    const mock_client = new TwitterMock();
    mock_client.throwError = false;
    return await mock_client.tweet(payload);
  }

  if (city.twitter == "berlindaylight") {
    return await en_client.v2.tweet(payload);
  } else if (city.twitter == "sonnezeitberlin"){
    return await de_client.v2.tweet(payload);
  }
};

async function getToday(city) {
  const coord = getLatLong(city)
  const today = new Date()
  const urlDate = lightFormat(today, 'yyyy-MM-dd')  
  const url = `${SUNRISE_BASE_URL}/json?lat=${coord.lat}&lng=${coord.long}&formatted=0&date=${urlDate}`
  return await axios.get(url)
}

async function getYesterday(city) {
  const coord = getLatLong(city)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const urlDate = lightFormat(yesterday, 'yyyy-MM-dd')
  const url = `${SUNRISE_BASE_URL}/json?lat=${coord.lat}&lng=${coord.long}&formatted=0&date=${urlDate}`
  return await axios.get(url)
}

export default async function handler(req, res) {

  console.log(res.query)

  if (req.headers['x-api-token'] != process.env.SERVICE_ACCESSTOKEN) {
    return res.status(401).json('{error : "invalid token"}')
  }

  if (req.query['city']) {
    if (!checkCity(req.query['city'])) {
      return res.status(422).json('{error : "invalid city"}')  
    }
  } else {
    return res.status(422).json('{error : "invalid query"}')
  }

  let city = locationDb[req.query['city']]
  
  var fetchedYesterdayResponse
  var fetchedTodayResponse

  await getYesterday(req.query['city']).then ( yesterdayResponse => {
    fetchedYesterdayResponse = yesterdayResponse
    return getToday(req.query['city'])
  }).then( todayResponse => {
    fetchedTodayResponse = todayResponse
    return generator.parseSunriseData(fetchedTodayResponse, fetchedYesterdayResponse, city.language, new Date(), city)
  }).then( tweetContent => {
    return post(tweetContent, city);
  }).then( postResults => {
    res.status(200).json(postResults)
  }).catch( (err) => {
    res.status(500).json(err)
  })
}
