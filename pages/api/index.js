import { TwitterApi } from 'twitter-api-v2';
import axios from 'axios';
const { utcToZonedTime, format } = require('date-fns-tz')
import { intervalToDuration, parseISO, lightFormat, formatDistanceStrict } from 'date-fns'
require('dotenv').config()

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

const berlinLat = 52.5170365
const berlinLong = 13.3888599


async function post(payload, locale) {
  if (locale == "en") {
    return await en_client.v2.tweet(payload);
  } else {
    return await de_client.v2.tweet(payload);
  }
};

function convertUTCDateToLocalDate(localDate) {
  const date = new Date(localDate)
  const timeZone = 'Europe/Berlin'
  const zonedDate = utcToZonedTime(date, timeZone)
  const time = format(zonedDate, 'HH:mm:ss')
  return time
}

function calculateDaylight(sunrise, sunset, locale) {
  const interval = intervalToDuration({
    start: parseISO(sunrise), end: parseISO(sunset)
  })

  var daylight

  if (interval.minutes == 1) {
    if (locale == "en") {
      daylight = `${interval.hours} hours, ${interval.minutes} minute`
    } else {
      daylight = `${interval.hours} Stunden, ${interval.minutes} Minute`
    }
  } else {
    if (locale == "en") {
      daylight = `${interval.hours} hours, ${interval.minutes} minutes`
    } else {
      daylight = `${interval.hours} Stunden, ${interval.minutes} Minuten`
    }
  }

  return daylight
  
}

function daylightDelta(todayData, yesterdayData, locale) {
    
    const daylightDeltaSeconds = (todayData.data.results.day_length - yesterdayData.data.results.day_length)
    const minutesDelta = parseInt(daylightDeltaSeconds / 60)
    const secsDelta = daylightDeltaSeconds - (minutesDelta * 60)

    const en_minLabel = (minutesDelta > 1 ? "mins" : "min")
    const en_secLabel = (secsDelta > 1 ? "secs" : "sec")

    const de_minLabel = "Min"
    const de_secLabel = "Sek"

    const deltaString = (locale == "en") ? `${minutesDelta} ${en_minLabel} ${secsDelta} ${en_secLabel}` : `${minutesDelta} ${de_minLabel} ${secsDelta} ${de_secLabel}`

    return deltaString
}

async function parseSunriseData(todayData, yesterdayData, locale) {

  const todaySunriseTime = convertUTCDateToLocalDate(todayData.data.results.sunrise)
  const yesterdaySunriseTime = convertUTCDateToLocalDate(yesterdayData.data.results.sunrise)
  
  const en_daylightDeltaString = daylightDelta(todayData, yesterdayData, "en")
  const de_daylightDeltaString = daylightDelta(todayData, yesterdayData, "de")

  const en_deltaType = (todayData.data.results.day_length > yesterdayData.data.results.day_length ? "more" : "less")
  const de_deltaType = (todayData.data.results.day_length > yesterdayData.data.results.day_length ? "mehr" : "weniger")

  const en_deltaString = `There will be ${en_daylightDeltaString} ${en_deltaType} daylight than yesterday`
  const de_deltaString = `Es wird ${de_daylightDeltaString} ${de_deltaType} Tageslicht als gestern`

  const sunsetTime = convertUTCDateToLocalDate(todayData.data.results.sunset)
  
  const en_daylightLength = calculateDaylight(todayData.data.results.sunrise, todayData.data.results.sunset, "en")
  const de_daylightLength = calculateDaylight(todayData.data.results.sunrise, todayData.data.results.sunset, "de")

  const en_tweetString = `Today in Berlin the sun will rise at ${todaySunriseTime} and set ${en_daylightLength} later at ${sunsetTime}. ${en_deltaString} (posted ${format(new Date(), 'HH:mm:ss')})`
  const de_tweetString = `Heute in Berlin geht die Sonne um ${todaySunriseTime} auf, und wird nach ${de_daylightLength} um ${sunsetTime} untergehen. ${de_deltaString} (geposted ${format(new Date(), 'HH:mm:ss')})`

  if (locale == "en") {
    return en_tweetString 
  } else {
    return de_tweetString
  }

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
  
  var fetchedYesterdayResponse
  var fetchedTodayResponse

  getYesterday().then ( yesterdayResponse => {
    fetchedYesterdayResponse = yesterdayResponse
    return getToday()
  }).then( todayResponse => {
    fetchedTodayResponse = todayResponse
    return parseSunriseData(fetchedTodayResponse, fetchedYesterdayResponse, "en")
  }).then( tweetContent => {
    return post(tweetContent, "en");
  }).then( () => {
    return parseSunriseData(fetchedTodayResponse, fetchedYesterdayResponse, "de")
  }).then( tweetContent => {
    return post(tweetContent, "de");
  }) .then( postingResult => {
    res.status(200).json(postingResult)
  }).catch( (err) => {
    res.status(500).json(err)
  })
}
