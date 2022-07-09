import { TwitterApi } from 'twitter-api-v2';
import axios from 'axios';
import { TwitterMock } from '../../utils/twitterMock'
import { lightFormat } from 'date-fns'
import { ContentGenerator } from '../../utils/contentGenerator'
import { locationDb, checkCity, getLatLong, Location } from  '../../utils/latlong'

require('dotenv').config()

const generator = new ContentGenerator()

export const SUNRISE_BASE_URL = "https://api.sunrise-sunset.org";
//export const SUNRISE_BASE_URL = "https://api.met.no/weatherapi/sunrise/2.0/.json"

async function post(payload, city: Location) {

  let client: TwitterApi

  switch (city.twitter) {
    case "sonnezeitberlin": {
      client = new TwitterApi({
        appKey: process.env.SONNENZEITBERLIN_APPKEY,
        appSecret: process.env.SONNENZEITBERLIN_APPSECRET,
        accessToken: process.env.SONNENZEITBERLIN_ACCESSTOKEN,
        accessSecret: process.env.SONNENZEITBERLIN_ACCESSSECRET
      });
      break;
    }
    case "berlindaylight": {
      client = new TwitterApi({
        appKey: process.env.BERLINDAYLIGHT_APPKEY,
        appSecret: process.env.BERLINDAYLIGHT_APPSECRET,
        accessToken: process.env.BERLINDAYLIGHT_ACCESSTOKEN,
        accessSecret: process.env.BERLINDAYLIGHT_ACCESSSECRET
      });
      break;
    }
    case "daylightinnyc": {
      client = new TwitterApi({
        appKey: process.env.DAYLIGHTINNYC_APPKEY,
        appSecret: process.env.DAYLIGHTINNYC_APPSECRET,
        accessToken: process.env.DAYLIGHTINNYC_ACCESSTOKEN,
        accessSecret: process.env.DAYLIGHTINNYC_ACCESSSECRET
      });
      break;
    }
    case "daylightinsfo": {
      client = new TwitterApi({
        appKey: process.env.DAYLIGHTINSFO_APPKEY,
        appSecret: process.env.DAYLIGHTINSFO_APPSECRET,
        accessToken: process.env.DAYLIGHTINSFO_ACCESSTOKEN,
        accessSecret: process.env.DAYLIGHTINSFO_ACCESSSECRET
      });
      break;
    }
    case "daylightlondon": {
      client = new TwitterApi({
        appKey: process.env.DAYLIGHTLDN_APPKEY,
        appSecret: process.env.DAYLIGHTLDN_APPSECRET,
        accessToken: process.env.DAYLIGHTLDN_ACCESSTOKEN,
        accessSecret: process.env.DAYLIGHTLDN_ACCESSSECRET
      });
      break;
    }
    case "lakesdaylight": {
      client = new TwitterApi({
        appKey: process.env.LAKESDAYLIGHT_APPKEY,
        appSecret: process.env.LAKESDAYLIGHT_APPSECRET,
        accessToken: process.env.LAKESDAYLIGHT_ACCESSTOKEN,
        accessSecret: process.env.LAKESDAYLIGHT_ACCESSSECRET
      });
      break;
    }
    default:
      console.log("DEFAULT")
      break;
  }

  //let mockTwitter = false;
  if (process.env.MOCK_TWITTER == "true") {
    //mockTwitter = true;
    const mock_client = new TwitterMock();
    mock_client.throwError = false;
    return await mock_client.tweet(payload);
  }

  // if (mockTwitter) {
  //   const mock_client = new TwitterMock();
  //   mock_client.throwError = false;
  //   return await mock_client.tweet(payload);
  // }

  const results = await client.v2.tweet(payload);
  console.log(results);
  return results;
  
};

async function getToday(city) {
  const coord = getLatLong(city)
  const today = new Date()
  const urlDate = lightFormat(today, 'yyyy-MM-dd')  
  const url = `${SUNRISE_BASE_URL}/json?lat=${coord.lat}&lng=${coord.long}&formatted=0&date=${urlDate}`
  // const url = `${SUNRISE_BASE_URL}?lat=${coord.lat}&lon=${coord.long}&date=${urlDate}&offset=00:00`
  const headers = { 'User-Agent' : 'Sonnenzeit Twitterbot/0.1 https://github.com/timd/sonnenzeit' }
  return await axios.get(url, { headers: headers})
}

async function getYesterday(city) {
  const coord = getLatLong(city)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const urlDate = lightFormat(yesterday, 'yyyy-MM-dd')
  const url = `${SUNRISE_BASE_URL}/json?lat=${coord.lat}&lng=${coord.long}&formatted=0&date=${urlDate}`
  //const url = `${SUNRISE_BASE_URL}?lat=${coord.lat}&lon=${coord.long}&date=${urlDate}&offset=00:00`
  const headers = { 'User-Agent' : 'Sonnenzeit Twitterbot/0.1 https://github.com/timd/sonnenzeit' }
  return await axios.get(url, { headers: headers})
  
}

export default async function handler(req, res) {

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
    console.log(`Content: ${tweetContent}`)
    return post(tweetContent, city);
  }).then( postResults => {
    res.status(200).json(postResults)
  }).catch( (err) => {
    res.status(500).json(err)
  })
}
