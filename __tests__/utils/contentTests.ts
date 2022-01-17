import { ContentGenerator }  from '../../utils/contentGenerator';
import { parseISO, isAfter, isBefore } from 'date-fns'
import { loadComponents } from 'next/dist/server/load-components';
import { getLatLong } from '../../utils/latlong';

const gen = new ContentGenerator();

const yesterday = {
  data: {
    results: {
      sunrise: "2022-01-08T07:00:00+00:00",
      sunset: "2022-01-08T17:01:02+00:00",
      solar_noon: "2022-01-08T11:13:07+00:00",
      day_length: 0,
      civil_twilight_begin: "2022-01-08T06:34:17+00:00",
      civil_twilight_end: "2022-01-08T15:51:57+00:00",
      nautical_twilight_begin: "2022-01-08T05:50:43+00:00",
      nautical_twilight_end: "2022-01-08T16:35:32+00:00",
      astronomical_twilight_begin: "2022-01-08T05:09:25+00:00",
      astronomical_twilight_end: "2022-01-08T17:16:49+00:00"
    },
    status: 'OK'
  },
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {},
  request: {}
}

const today = {
  data: {
    results: {
      sunrise: "2022-01-09T08:00:00+00:00",
		  sunset: "2022-01-09T18:01:02+00:00",
		  solar_noon: "2022-01-09T11:13:32+00:00",
		  day_length: 635,
		  civil_twilight_begin: "2022-01-09T06:33:50+00:00",
		  civil_twilight_end: "2022-01-09T15:53:14+00:00",
		  nautical_twilight_begin: "2022-01-09T05:50:21+00:00",
		  nautical_twilight_end: "2022-01-09T16:36:43+00:00",
		  astronomical_twilight_begin: "2022-01-09T05:09:06+00:00",
		  astronomical_twilight_end: "2022-01-09T17:17:58+00:00"
    },
    status: 'OK'
  },
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {},
  request: {}
}

test('calculates correct daylight delta string in English', () => {
  let result = gen.daylightDelta(today, yesterday, "en")
  expect(result).toEqual("10 mins 35 secs")
});

test('calculates plurals correctly in English', () => {

  // 0 mins 0 secs
  today.data.results.day_length = 0
  let result = gen.daylightDelta(today, yesterday, "en")
  expect(result).toEqual("0 mins 0 secs")

  // 0 mins 1 sec
  today.data.results.day_length = 1 
  result = gen.daylightDelta(today, yesterday, "en")
  expect(result).toEqual("0 mins 1 sec")

  // 0 mins 10 secs
  today.data.results.day_length = 10 
  result = gen.daylightDelta(today, yesterday, "en")
  expect(result).toEqual("0 mins 10 secs")

  // 1 min 0 secs
  today.data.results.day_length = 60
  result = gen.daylightDelta(today, yesterday, "en")
  expect(result).toEqual("1 min 0 secs")

  // 1 min 30 secs
  today.data.results.day_length = 90
  result = gen.daylightDelta(today, yesterday, "en")
  expect(result).toEqual("1 min 30 secs")

  // 10 min 0 secs
  today.data.results.day_length = 600
  result = gen.daylightDelta(today, yesterday, "en")
  expect(result).toEqual("10 mins 0 secs")
  
  // 10 min 1 sec
  today.data.results.day_length = 601
  result = gen.daylightDelta(today, yesterday, "en")
  expect(result).toEqual("10 mins 1 sec")

  // 10 min 5 secs
  today.data.results.day_length = 605
  result = gen.daylightDelta(today, yesterday, "en")
  expect(result).toEqual("10 mins 5 secs")

});

test('calculates correct daylight delta string in German', () => {
  today.data.results.day_length = 635
  let result = gen.daylightDelta(today, yesterday, "de")
  expect(result).toEqual("10 Min 35 Sek")
});

test('calculates correct daylight hours in English', () => {
  
  // 8 hours, 1 minute
  let res8h1m = gen.calculateDaylight("2022-01-08T00:00:00+00:00", "2022-01-08T08:01:37+00:00", "en")
  expect(res8h1m).toEqual("8 hours, 1 minute")

  // 8 hours, 10 minutes
  let res8h10m = gen.calculateDaylight("2022-01-08T00:00:00+00:00", "2022-01-08T08:10:37+00:00", "en")
  expect(res8h10m).toEqual("8 hours, 10 minutes")
});

test('calculates correct daylight hours in German', () => {

  // 8 hours, 1 minute
  let res8h1m = gen.calculateDaylight("2022-01-08T00:00:00+00:00", "2022-01-08T08:01:37+00:00", "de")
  expect(res8h1m).toEqual("8 Stunden, 1 Minute")

  // 8 hours, 10 minutes
  let res8h10m = gen.calculateDaylight("2022-01-08T00:00:00+00:00", "2022-01-08T08:10:37+00:00", "de")
  expect(res8h10m).toEqual("8 Stunden, 10 Minuten")
});

test('convertUTCDateToLocalDate', () => {
  let utcDate = "2022-01-08T00:00:00+00:00"
  let convertedDate = gen.convertUTCDateToLocalDate(utcDate, "Europe/Berlin");
  expect(convertedDate).toEqual("01:00:00")
});

test('correct tense when tweet is posted after sunrise in English', () => {
  // sunrise at 2022-01-09T07:00:00+00:00, test run at 12h00
  const london = getLatLong('BER-EN')
  let testDate = parseISO("2022-01-09T12:00:00+00:00")
  let sunrise = parseISO(today.data.results.sunrise)
  let result = gen.parseSunriseData(today, yesterday, "en", testDate, london)
  expect(result).toEqual("Today in Berlin the sun rose at 09:00:00, 60 min 0 secs later than yesterday, and will set 10 hours, 1 minute later at 19:01:02, 60 min 0 secs later than yesterday. There will be 10 mins 35 secs more daylight than yesterday")
});

test('correct tense when tweet is posted after sunrise in German', () => {
  // sunrise at 2022-01-09T07:00:00+00:00, test run at 10h00
  const berlin = getLatLong('BER')
  let testDate = parseISO("2022-01-09T10:00:00+00:00")
  let sunrise = parseISO(today.data.results.sunrise)
  let result = gen.parseSunriseData(today, yesterday, "de", testDate, berlin)
  expect(result).toEqual("Heute in Berlin hat die Sonne um 09:00:00 aufgegangen, 60 Min 0 Sek später seit gestern, und wird nach 10 Stunden, 1 Minute um 19:01:02 untergehen, 60 Min 0 Sek später seit gestern. Es wird 10 Min 35 Sek mehr Tageslicht als gestern")
});

test('correct tense when tweet is posted before sunrise in English', () => {
  // sunrise at 2022-01-09T07:00:00+00:00, test run at 03h00
  const london = getLatLong('BER-EN')
  let testDate = parseISO("2022-01-09T03:00:00+00:00")
  let sunrise = parseISO(today.data.results.sunrise)
  let result = gen.parseSunriseData(today, yesterday, "en", testDate, london)
  expect(result).toEqual("Today in Berlin the sun will rise at 09:00:00, 60 min 0 secs later than yesterday, and will set 10 hours, 1 minute later at 19:01:02, 60 min 0 secs later than yesterday. There will be 10 mins 35 secs more daylight than yesterday")
});

test('correct tense when tweet is posted before sunrise in German', () => {
  // sunrise at 2022-01-09T07:00:00+00:00, test run at 03h00
  const berlin = getLatLong('BER')
  let testDate = parseISO("2022-01-09T03:00:00+00:00")
  let sunrise = parseISO(today.data.results.sunrise)
  let result = gen.parseSunriseData(today, yesterday, "de", testDate, berlin)
  expect(result).toEqual("Heute in Berlin geht die Sonne um 09:00:00 auf, 60 Min 0 Sek später seit gestern, und wird nach 10 Stunden, 1 Minute um 19:01:02 untergehen, 60 Min 0 Sek später seit gestern. Es wird 10 Min 35 Sek mehr Tageslicht als gestern")
});