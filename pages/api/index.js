// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { TwitterApi } from 'twitter-api-v2';
import axios from 'axios';
const { zonedTimeToUtc, utcToZonedTime, format } = require('date-fns-tz')
import { intervalToDuration, parseISO } from 'date-fns'

const client = new TwitterApi({
  appKey: 'kK2Xs6ayhzwqyJn0o5FkjaPEs',
  appSecret: 'w8i0kt6futvKNDAnpWsJdbf5lcZr4xJSaHhkAUYfk7xTys1MUp',
  accessToken: '1479805238282526721-zOjpYUoACpw3dtiOlbfp2nuShyEBfw',
  accessSecret: '8HpDJSoFKs8nmFlSoAlZ0NC94QWP4BWJ1UgDaLjniEFZR',
});

async function fetch() {
  return await client.v2.userTimeline('12');
};

async function post(payload) {
  return await client.v2.tweet(payload);
};

function convertUTCDateToLocalDate(localDate) {
  const date = new Date(localDate)
  const timeZone = 'Europe/Berlin'
  const zonedDate = utcToZonedTime(date, timeZone)
  const time = format(zonedDate, 'HH:mm:ss')
  return time
}

function calculateDaylight(sunrise, sunset) {
  const interval = intervalToDuration({
    start: parseISO(sunrise), end: parseISO(sunset)
  })

  var daylight

  if (interval.minutes == 1) {
    daylight = `${interval.hours} hours, ${interval.minutes} minute`
  } else {
    daylight = `${interval.hours} hours, ${interval.minutes} minutes`
  }

  return daylight
  
}

async function parseSunriseData(sunriseData) {

  const sunriseTime = convertUTCDateToLocalDate(sunriseData.data.results.sunrise)
  
  const dayLengthInHours = sunriseData.data.results.day_length / 3600
  
  const sunsetTime = convertUTCDateToLocalDate(sunriseData.data.results.sunset)

  const daylightLength = calculateDaylight(sunriseData.data.results.sunrise, sunriseData.data.results.sunset)

  const tweetString = `Today in Berlin the sun will rise at ${sunriseTime} and set ${daylightLength} later at ${sunsetTime} (posted ${format(new Date(), 'HH:mm:ss')})`
  
  return tweetString
}

export default async function handler(req, res) {
  const url = "https://api.sunrise-sunset.org/json?lat=52.5170365&lng=13.3888599&formatted=0"
  
  axios.get(url).then( sunriseApiResponse => {
    return parseSunriseData(sunriseApiResponse)
  }).then( tweetContent => {
    return post(tweetContent);
  }).then( postingResult => {
    res.status(200).json(postingResult)
  }).catch( (err) => {
    res.status(500).json(err)
  })
}
