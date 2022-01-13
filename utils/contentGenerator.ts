import { AxiosResponse } from 'axios';
import { intervalToDuration, parseISO, isBefore, formatDistanceStrict } from 'date-fns'
import { utcToZonedTime, format } from 'date-fns-tz';
import { enGB, de } from 'date-fns/locale'

class ContentGenerator {

  daylightDelta(todayData: AxiosResponse, yesterdayData: AxiosResponse, locale: string): string {
    
    let todayLength = todayData.data.results.day_length as number;
    let yesterdayLength = yesterdayData.data.results.day_length as number;
    let daylightDeltaSeconds = todayLength - yesterdayLength

    const minutesDelta = (daylightDeltaSeconds / 60) | 0
    // const minutesDelta = Math.floor(daylightDeltaSeconds / 60)
    const secsDelta = daylightDeltaSeconds - (minutesDelta * 60)

    const en_minLabel = (minutesDelta == 1 ? "min" : "mins")
    const en_secLabel = (secsDelta == 1 ? "sec" : "secs")

    const de_minLabel = "Min"
    const de_secLabel = "Sek"

    const deltaString = (locale == "en") ? `${minutesDelta} ${en_minLabel} ${secsDelta} ${en_secLabel}` : `${minutesDelta} ${de_minLabel} ${secsDelta} ${de_secLabel}`

    return deltaString
  }

  calculateDaylight(sunrise, sunset, locale) {
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

  convertUTCDateToLocalDate(localDate) {
    const date = new Date(localDate)
    const timeZone = 'Europe/Berlin'
    const zonedDate = utcToZonedTime(date, timeZone)
    const time = format(zonedDate, 'HH:mm:ss')
    return time
  }

  parseSunriseData(todayData, yesterdayData, locale, currentTime) {

    const enSuperlatives = ["an astounding", "a quite frankly astonishing", "a reassuringly larger amount of", "unbelievably", "yet another", "a seemingly vast increase of", "a reassuring", "at least" ]

    const todaySunriseTime = this.convertUTCDateToLocalDate(todayData.data.results.sunrise)
    const yesterdaySunriseTime = this.convertUTCDateToLocalDate(yesterdayData.data.results.sunrise)
    
    const daylightDeltaString = this.daylightDelta(todayData, yesterdayData, locale)
    
    const en_deltaType = (todayData.data.results.day_length > yesterdayData.data.results.day_length ? "more" : "less")
    const de_deltaType = (todayData.data.results.day_length > yesterdayData.data.results.day_length ? "mehr" : "weniger")
  
    const en_deltaString = `There will be ${daylightDeltaString} ${en_deltaType} daylight than yesterday`
    const de_deltaString = `Es wird ${daylightDeltaString} ${de_deltaType} Tageslicht als gestern`
  
    const sunsetTime = this.convertUTCDateToLocalDate(todayData.data.results.sunset)
    
    const daylightLength = this.calculateDaylight(todayData.data.results.sunrise, todayData.data.results.sunset, locale)
    
    const todaySunrise = parseISO(todayData.data.results.sunrise)

    let en_tweetString: string;
    let de_tweetString: string;

    if (isBefore(todaySunrise, currentTime)) {
      en_tweetString = `Today in Berlin the sun rose at ${todaySunriseTime} and will set ${daylightLength} later at ${sunsetTime}. ${en_deltaString}`
      de_tweetString = `Heute in Berlin hat die Sonne um ${todaySunriseTime} aufgegangen, und wird nach ${daylightLength} um ${sunsetTime} untergehen. ${de_deltaString}`
    } else {
      en_tweetString = `Today in Berlin the sun will rise at ${todaySunriseTime} and will set ${daylightLength} later at ${sunsetTime}. ${en_deltaString}`
      de_tweetString = `Heute in Berlin geht die Sonne um ${todaySunriseTime} auf, und wird nach ${daylightLength} um ${sunsetTime} untergehen. ${de_deltaString}`
    }
    
    if (locale == "en") {
      return en_tweetString 
    } else {
      return de_tweetString
    }
  
  }

  sunriseDelta(todayData, yesterdayData, locale) {
    const todayH = format(new Date(todayData.data.results.sunrise), "HH");
    const todayM = format(new Date(todayData.data.results.sunrise), "mm");
    const todayS = format(new Date(todayData.data.results.sunrise), "ss");

    const yesterdayH = format(new Date(yesterdayData.data.results.sunrise), "HH");
    const yesterdayM = format(new Date(yesterdayData.data.results.sunrise), "mm");
    const yesterdayS = format(new Date(yesterdayData.data.results.sunrise), "ss");

    const today = new Date(2022,1,1,parseInt(todayH),parseInt(todayM),parseInt(todayS))
    const yesterday = new Date(2022,1,1,parseInt(yesterdayH),parseInt(yesterdayM),parseInt(yesterdayS))

    const todaySecs = new Date(2022,1,1,0,0,parseInt(todayS))
    const yesterdaySecs = new Date(2022,1,1,0,0,parseInt(yesterdayS))
    
    const todayMins = new Date(2022,1,1,0,parseInt(todayM),0)
    const yesterdayMins = new Date(2022,1,1,0,parseInt(yesterdayM),0)
    
    let results: string
    let secsResult: string
    let minsResult: string
    let suffix: string

    if (isBefore(today, yesterday)){
      if (locale === "en") {
        suffix = "earlier"
        results = formatDistanceStrict(today, yesterday, {locale: enGB})
        secsResult = formatDistanceStrict(todaySecs, yesterdaySecs, {locale: enGB})
        minsResult = formatDistanceStrict(todayMins, yesterdayMins, {locale: enGB})  
      } else {
        suffix = "früher"
        secsResult = formatDistanceStrict(todaySecs, yesterdaySecs, {locale: de})
        minsResult = formatDistanceStrict(todayMins, yesterdayMins, {locale: de})  
      }
    } else {
      if (locale === "en") {
        suffix = "later"
        secsResult = formatDistanceStrict(yesterdaySecs, todaySecs, {locale: enGB})
        minsResult = formatDistanceStrict(yesterdayMins, todayMins, {locale: enGB})  
      } else {
        suffix = "später"
        secsResult = formatDistanceStrict(todaySecs, yesterdaySecs, {locale: de})
        minsResult = formatDistanceStrict(todayMins, yesterdayMins, {locale: de})  
      }
    }
    
    const secsDelta = secsResult.split(" ")[0]
    const minsDelta = minsResult.split(" ")[0]

    if (secsDelta === "0" && minsDelta === "0") {
      if (locale === "en") {
        return "the same as"
      } else {
        return "das gleiche wie"
      }
    } else if (minsDelta === "0") {
      return `${secsResult} ${suffix}` 
    } else if (secsDelta === "0") {
      return `${minsResult} ${suffix}`
    } else {
      return `${minsResult} ${secsResult} ${suffix}`
    }
     
  }

}

export { ContentGenerator }