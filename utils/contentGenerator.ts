import { AxiosResponse } from 'axios';
import { intervalToDuration, parseISO, isBefore, differenceInMinutes, differenceInSeconds, differenceInDays, isAfter } from 'date-fns'
import { utcToZonedTime, format } from 'date-fns-tz';
import { Location } from './latlong';

interface SunDelta {
  sunriseDelta: string,
  sunsetDelta: string
}
class ContentGenerator {

  calculateSunDelta(todayData, yesterdayData, language): SunDelta {
    
    // Create date from supplied data
    const fullTdaySunrise = new Date(todayData.data.results.sunrise)
    const fullTdaySunset = new Date(todayData.data.results.sunset)
    const fullYdaySunrise = new Date(yesterdayData.data.results.sunrise)
    const fullYdaySunset = new Date(yesterdayData.data.results.sunset)

    // Split out the time components
    const tdaySunrise = [fullTdaySunrise.getHours(), fullTdaySunrise.getMinutes(), fullTdaySunrise.getSeconds()]
    const tdaySunset = [fullTdaySunset.getHours(), fullTdaySunset.getMinutes(), fullTdaySunset.getSeconds()]
    const ydaySunrise = [fullYdaySunrise.getHours(), fullYdaySunrise.getMinutes(), fullYdaySunrise.getSeconds()]
    const ydaySunset = [fullYdaySunset.getHours(), fullYdaySunset.getMinutes(), fullYdaySunset.getSeconds()]

    // Create basedlined dates
    let baselinedTsunrise = new Date( 2022, 1, 1, tdaySunrise[0], tdaySunrise[1], tdaySunrise[2] )
    let baselinedTsunset = new Date( 2022, 1, 1, tdaySunset[0], tdaySunset[1], tdaySunset[2] )
    let baselinedYsunrise = new Date( 2022, 1, 1, ydaySunrise[0], ydaySunrise[1], ydaySunrise[2] )
    let baselinedYsunset = new Date( 2022, 1, 1, ydaySunset[0], ydaySunset[1], ydaySunset[2] )

    const sunriseDiffMins = differenceInMinutes(baselinedTsunrise, baselinedYsunrise)
    const sunriseDiffSecs = differenceInSeconds(baselinedTsunrise, baselinedYsunrise)
    const sunsetDiffMins = differenceInMinutes(baselinedTsunset, baselinedYsunset)
    const sunsetDiffSecs = differenceInSeconds(baselinedTsunset, baselinedYsunset)

    // calculate mins & secs

    // Check if sunrise time are increasing or decreasing
    // is today later than yesterday?
    const isSunriseEarlier = isBefore(baselinedTsunrise, baselinedYsunrise)
    var sunriseMinutes = Math.floor(Math.abs(sunriseDiffSecs) / 60);
    var sunriseSeconds = Math.abs(sunriseDiffSecs) - (sunriseMinutes * 60);

    const isSunsetLater = isBefore(baselinedYsunset, baselinedTsunset)
    var sunsetMinutes = Math.floor(Math.abs(sunsetDiffSecs) / 60);
    var sunsetSeconds = Math.abs(sunsetDiffSecs) - (sunsetMinutes * 60);

    // Assemble string
    let sunriseDeltaText: string
    let sunsetDeltaText: string
    
    let minSuffix: string
    let secSuffix: string
    
    let sunriseSuffix: string
    let sunsetSuffix: string

    if (language === "de") {
      minSuffix = "Min";
      secSuffix = "Sek";
      (isSunriseEarlier) ? sunriseSuffix = "früher" : sunriseSuffix = "später";
      (isSunsetLater) ? sunsetSuffix = "später" : sunsetSuffix = "früher";
    } else {
      minSuffix = "min";
      secSuffix = "secs";
      (isSunriseEarlier) ? sunriseSuffix = "earlier" : sunriseSuffix = "later";
      (isSunsetLater) ? sunsetSuffix = "later" : sunsetSuffix = "earlier";
    }

    sunriseDeltaText = `${Math.abs(sunriseMinutes)} ${minSuffix} ${sunriseSeconds} ${secSuffix} ${sunriseSuffix}`
    sunsetDeltaText = `${Math.abs(sunsetMinutes)} ${minSuffix} ${sunsetSeconds} ${secSuffix} ${sunsetSuffix}`

    return {
      sunriseDelta: sunriseDeltaText,
      sunsetDelta: sunsetDeltaText
    }

  }

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

  convertUTCDateToLocalDate(localDate, timezone) {
    const date = new Date(localDate)
    const zonedDate = utcToZonedTime(date, timezone)
    const time = format(zonedDate, 'HH:mm:ss')
    return time
  }

  parseSunriseData(todayData, yesterdayData, locale, currentTime, city: Location) {

    const todaySunriseTime = this.convertUTCDateToLocalDate(todayData.data.results.sunrise, city.timezone)
    const yesterdaySunriseTime = this.convertUTCDateToLocalDate(yesterdayData.data.results.sunrise, city.timezone)
    
    const daylightDeltaString = this.daylightDelta(todayData, yesterdayData, locale)
    
    const en_deltaType = (todayData.data.results.day_length > yesterdayData.data.results.day_length ? "more" : "less")
    const de_deltaType = (todayData.data.results.day_length > yesterdayData.data.results.day_length ? "mehr" : "weniger")
  
    const en_deltaString = `There will be ${daylightDeltaString} ${en_deltaType} daylight than yesterday`
    const de_deltaString = `Es wird ${daylightDeltaString} ${de_deltaType} Tageslicht als gestern`
  
    const sunsetTime = this.convertUTCDateToLocalDate(todayData.data.results.sunset, city.timezone)
    
    const daylightLength = this.calculateDaylight(todayData.data.results.sunrise, todayData.data.results.sunset, locale)
    
    const todaySunrise = parseISO(todayData.data.results.sunrise)

    const enDelta = this.calculateSunDelta(todayData, yesterdayData, "en")
    const deDelta = this.calculateSunDelta(todayData, yesterdayData, "de")

    let en_tweetString: string;
    let de_tweetString: string;

    if (isBefore(todaySunrise, currentTime)) {
      en_tweetString = `Today in ${city.name} the sun rose at ${todaySunriseTime}, ${enDelta.sunriseDelta} than yesterday, and will set ${daylightLength} later at ${sunsetTime}, ${enDelta.sunsetDelta} than yesterday. ${en_deltaString}`
      de_tweetString = `Heute in ${city.name} hat die Sonne um ${todaySunriseTime} aufgegangen, ${deDelta.sunriseDelta} seit gestern, und wird nach ${daylightLength} um ${sunsetTime} untergehen, ${deDelta.sunsetDelta} seit gestern. ${de_deltaString}`
    } else {
      en_tweetString = `Today in ${city.name} the sun will rise at ${todaySunriseTime}, ${enDelta.sunriseDelta} than yesterday, and will set ${daylightLength} later at ${sunsetTime}, ${enDelta.sunsetDelta} than yesterday. ${en_deltaString}`
      de_tweetString = `Heute in ${city.name} geht die Sonne um ${todaySunriseTime} auf, ${deDelta.sunriseDelta} seit gestern, und wird nach ${daylightLength} um ${sunsetTime} untergehen, ${deDelta.sunsetDelta} seit gestern. ${de_deltaString}`
    }
    
    if (locale == "en") {
      return en_tweetString 
    } else {
      return de_tweetString
    }
  
  }

}

export { ContentGenerator }
      

