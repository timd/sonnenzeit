import { AxiosResponse } from 'axios';
import { intervalToDuration, parseISO, isBefore, isAfter } from 'date-fns'
import { utcToZonedTime, format } from 'date-fns-tz';

class ContentGenerator {

  daylightDelta(todayData: AxiosResponse, yesterdayData: AxiosResponse, locale: string): string {
    
    let todayLength = todayData.data.results.day_length as number;
    let yesterdayLength = yesterdayData.data.results.day_length as number;
    let daylightDeltaSeconds = todayLength - yesterdayLength

    const minutesDelta = Math.floor(daylightDeltaSeconds / 60)
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

}

export { ContentGenerator }