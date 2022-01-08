// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { TwitterApi } from 'twitter-api-v2';
import axios from 'axios';
const { zonedTimeToUtc, utcToZonedTime, format } = require('date-fns-tz')
import { intervalToDuration, parseISO, subDays, lightFormat, formatDistanceStrict } from 'date-fns'

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

function daylightDelta(todayData, yesterdayData) {
    
    const daylightDeltaSeconds = (todayData.data.results.day_length - yesterdayData.data.results.day_length)
    const minutesDelta = parseInt(daylightDeltaSeconds / 60)
    const secsDelta = daylightDeltaSeconds - (minutesDelta * 60)

    const minLabel = (minutesDelta > 1 ? "mins" : "min")
    const secLabel = (secsDelta > 1 ? "secs" : "sec")

    const deltaString = `${minutesDelta} ${minLabel} ${secsDelta} ${secLabel}`
    return deltaString
}

async function parseSunriseData(todayData, yesterdayData) {

  const todaySunriseTime = convertUTCDateToLocalDate(todayData.data.results.sunrise)
  const yesterdaySunriseTime = convertUTCDateToLocalDate(yesterdayData.data.results.sunrise)
  
  const daylightDeltaString = daylightDelta(todayData, yesterdayData)

  const deltaType = (todayData.data.results.day_length > yesterdayData.data.results.day_length ? "more" : "less")
  
  const deltaString = `There will be ${daylightDeltaString} ${deltaType} daylight than yesterday`

  const sunsetTime = convertUTCDateToLocalDate(todayData.data.results.sunset)
  const daylightLength = calculateDaylight(todayData.data.results.sunrise, todayData.data.results.sunset)
  const tweetString = `Today in Berlin the sun will rise at ${todaySunriseTime} and set ${daylightLength} later at ${sunsetTime}. ${deltaString} (posted ${format(new Date(), 'HH:mm:ss')})`

  return tweetString
}

function calculateDaylightDiff(todaySunriseTime, yesterdaySunriseTime) {
  const todayTime = lightFormat(parseISO(todaySunriseTime), 'HHmmss')
  const yesterdayTime = lightFormat(parseISO(yesterdaySunriseTime), 'HHmmss')

  const diff = formatDistanceStrict(
    parseISO(todayTime),
    parseISO(yesterdayTime)
  )

  return diff
}

async function getToday() {
  const today = new Date()
  const urlDate = lightFormat(today, 'yyyy-MM-dd')  
  const url = `https://api.sunrise-sunset.org/json?lat=52.5170365&lng=13.3888599&formatted=0&date=${urlDate}`
  return await axios.get(url)
}

async function getYesterday() {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
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
