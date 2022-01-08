// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { TwitterApi } from 'twitter-api-v2';
import axios from 'axios';
const { zonedTimeToUtc, utcToZonedTime, format } = require('date-fns-tz')
import { intervalToDuration, parseISO, startOfYesterday, lightFormat, formatDistanceStrict } from 'date-fns'

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

async function parseSunriseData(todayData, yesterdayData) {

  const todaySunriseTime = convertUTCDateToLocalDate(todayData.data.results.sunrise)
  const yesterdaySunriseTime = convertUTCDateToLocalDate(yesterdayData.data.results.sunrise)
  
  // const daylightDiff = calculateDaylightDiff(todayData.data.results.sunrise, yesterdayData.data.results.sunrise)
  
  const sunsetTime = convertUTCDateToLocalDate(todayData.data.results.sunset)
  const daylightLength = calculateDaylight(todayData.data.results.sunrise, todayData.data.results.sunset)
  const tweetString = `Today in Berlin the sun will rise at ${todaySunriseTime} and set ${daylightLength} later at ${sunsetTime} (posted ${format(new Date(), 'HH:mm:ss')})`
  return tweetString
}

function calculateDaylightDiff(todaySunriseTime, yesterdaySunriseTime) {
  const todayTime = lightFormat(parseISO(todaySunriseTime), 'HHmmss')
  const yesterdayTime = lightFormat(parseISO(yesterdaySunriseTime), 'HHmmss')

  const diff = formatDistanceStrict(
    parseISO(todayTime),
    parseISO(yesterdayTime)
  )
  console.log(`diff: ${diff}`)
  return diff
}

async function getToday() {
  const url = "https://api.sunrise-sunset.org/json?lat=52.5170365&lng=13.3888599&formatted=0"
  return await axios.get(url)
}

async function getYesterday() {
  const yesterday = startOfYesterday()
  const urlDate = lightFormat(yesterday, 'yyyy-MM-dd')
  const url = `https://api.sunrise-sunset.org/json?lat=52.5170365&lng=13.3888599&formatted=0&date=${urlDate}`
  return await axios.get(url)
}

export default async function handler(req, res) {
  
  var fetchedYesterdayResponse

  getYesterday().then ( yesterdayResponse => {
    fetchedYesterdayResponse = yesterdayResponse
    return getToday()
  }).then( todayResponse => {
    return parseSunriseData(todayResponse, fetchedYesterdayResponse)
  }).then( tweetContent => {
    return post(tweetContent);
  }).then( postingResult => {
    res.status(200).json(postingResult)
  }).catch( (err) => {
    res.status(500).json(err)
  })
}
