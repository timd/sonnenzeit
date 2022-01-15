import { AxiosResponse } from 'axios';
import { format, intervalToDuration, parseISO, isBefore, formatDistanceStrict, set } from 'date-fns'
import { utcToZonedTime } from 'date-fns-tz';
import { enGB, de, tr } from 'date-fns/locale'

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

  createNormalisedTimes(tdayData,ydayData): Array<Date> {
    
    const tDay = new Date(tdayData.data.results.sunrise)
    const yDay = new Date(ydayData.data.results.sunrise)

    const ntDay = set(tDay, { year: 2022, month: 9, date: 1 })
    const nyDay = set(yDay, { year: 2022, month: 9, date: 1 })

    console.log(ntDay)
    console.log(nyDay)

    return [ntDay, nyDay]
  }

  dayIsLonger(tdayData, ydayData): boolean {
    return true;
  }

  sunriseDelta(todayData, yesterdayData, loc) {

    
    
    // Create dummy dates
    const checkTdayTime = new Date(tdayTime)
    const checkYdayTime = new Date(ydayTime)

    console.log(checkTdayTime);
    console.log(checkYdayTime)


  

    // Check if today's getting longer or shorter
    isBefore(today, yesterday) ? isLonger = true : isLonger = false;

    let firstData: any
    let secondData: any
    let suffix: string

    // Arrange times
    if (isLonger) {
      firstData = yesterdayData;
      secondData = todayData;
      (loc.code === "en-GB" ? suffix = "earlier" : suffix = "früher")
    } else {
      firstData = todayData;
      secondData = yesterdayData;
      (loc.code === "en-GB" ? suffix = "later" : suffix = "später")
    }

    // Extract data from swapped dates
    const swappedTodayH = format(new Date(firstData.data.results.sunrise), "HH");
    const swappedTodayM = format(new Date(firstData.data.results.sunrise), "mm");
    const swappedTodayS = format(new Date(firstData.data.results.sunrise), "ss");

    const swappedYesterdayH = format(new Date(secondData.data.results.sunrise), "HH");
    const swappedYesterdayM = format(new Date(secondData.data.results.sunrise), "mm");
    const swappedYesterdayS = format(new Date(secondData.data.results.sunrise), "ss");

    const todaySecs = new Date(2022,1,1,0,0,parseInt(swappedTodayS))
    const yesterdaySecs = new Date(2022,1,1,0,0,parseInt(swappedYesterdayS))
    
    const todayMins = new Date(2022,1,1,0,parseInt(swappedTodayM),0)
    const yesterdayMins = new Date(2022,1,1,0,parseInt(swappedYesterdayM),0)
    
    let results: string
    let secsResult: string
    let minsResult: string

    if (loc.code === "en-GB") {
      results = formatDistanceStrict(today, yesterday, {locale: enGB})
      secsResult = formatDistanceStrict(todaySecs, yesterdaySecs, {locale: enGB})
      minsResult = formatDistanceStrict(todayMins, yesterdayMins, {locale: enGB})  
    } else {
      results = formatDistanceStrict(today, yesterday, {locale: de})
      secsResult = formatDistanceStrict(todaySecs, yesterdaySecs, {locale: de})
      minsResult = formatDistanceStrict(todayMins, yesterdayMins, {locale: de})  
    }

    const secsDelta = secsResult.split(" ")[0]
    const minsDelta = minsResult.split(" ")[0]

    if (secsDelta === "0" && minsDelta === "0") {
      if (loc.code === "en-GB") {
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