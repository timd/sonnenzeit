import { ContentGenerator }  from '../../utils/contentGenerator';
import cart from '../../pages/api/cart';
import { getPageFiles } from 'next/dist/server/get-page-files';
import { Axios } from 'axios';

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
  gen.locale = "en"
  let result = gen.daylightDelta(today, yesterday)
  expect(result).toEqual("10 mins 35 secs")
});

test('calculates plurals correctly in English', () => {
  gen.locale = "en"

  // 0 mins 0 secs
  today.data.results.day_length = 0
  let result = gen.daylightDelta(today, yesterday)
  expect(result).toEqual("0 mins 0 secs")

  // 0 mins 1 sec
  today.data.results.day_length = 1 
  result = gen.daylightDelta(today, yesterday)
  expect(result).toEqual("0 mins 1 sec")

  // 0 mins 10 secs
  today.data.results.day_length = 10 
  result = gen.daylightDelta(today, yesterday)
  expect(result).toEqual("0 mins 10 secs")

  // 1 min 0 secs
  today.data.results.day_length = 60
  result = gen.daylightDelta(today, yesterday)
  expect(result).toEqual("1 min 0 secs")

  // 1 min 30 secs
  today.data.results.day_length = 90
  result = gen.daylightDelta(today, yesterday)
  expect(result).toEqual("1 min 30 secs")

  // 10 min 0 secs
  today.data.results.day_length = 600
  result = gen.daylightDelta(today, yesterday)
  expect(result).toEqual("10 mins 0 secs")
  
  // 10 min 1 sec
  today.data.results.day_length = 601
  result = gen.daylightDelta(today, yesterday)
  expect(result).toEqual("10 mins 1 sec")

  // 10 min 5 secs
  today.data.results.day_length = 605
  result = gen.daylightDelta(today, yesterday)
  expect(result).toEqual("10 mins 5 secs")

});

test('calculates correct daylight delta string in German', () => {
  gen.locale = "de"
  today.data.results.day_length = 635
  let result = gen.daylightDelta(today, yesterday)
  expect(result).toEqual("10 Min 35 Sek")
});

test('calculates correct daylight hours in English', () => {
  
  gen.locale = "en"
  
  // 8 hours, 1 minute
  let res8h1m = gen.calculateDaylight("2022-01-08T00:00:00+00:00", "2022-01-08T08:01:37+00:00")
  expect(res8h1m).toEqual("8 hours, 1 minute")

  // 8 hours, 10 minutes
  let res8h10m = gen.calculateDaylight("2022-01-08T00:00:00+00:00", "2022-01-08T08:10:37+00:00")
  expect(res8h10m).toEqual("8 hours, 10 minutes")
});

test('calculates correct daylight hours in German', () => {
  gen.locale = "de"

  // 8 hours, 1 minute
  let res8h1m = gen.calculateDaylight("2022-01-08T00:00:00+00:00", "2022-01-08T08:01:37+00:00")
  expect(res8h1m).toEqual("8 Stunden, 1 Minute")

  // 8 hours, 10 minutes
  let res8h10m = gen.calculateDaylight("2022-01-08T00:00:00+00:00", "2022-01-08T08:10:37+00:00")
  expect(res8h10m).toEqual("8 Stunden, 10 Minuten")
});

test('convertUTCDateToLocalDate', () => {
  let utcDate = "2022-01-08T00:00:00+00:00"
  let convertedDate = gen.convertUTCDateToLocalDate(utcDate);
  expect(convertedDate).toEqual("01:00:00")
});

test('parseSunriseData in English', () => {
  gen.locale = "en"
  let result = gen.parseSunriseData(today, yesterday)
  expect(result).toEqual("Today in Berlin the sun will rise at 09:00:00 and set 10 hours, 1 minute later at 19:01:02. There will be 10 mins 35 secs more daylight than yesterday")
});

test('parseSunriseData in German', () => {
  gen.locale = "de"
  let result = gen.parseSunriseData(today, yesterday)
  expect(result).toEqual("Heute in Berlin geht die Sonne um 09:00:00 auf, und wird nach 10 Stunden, 1 Minute um 19:01:02 untergehen. Es wird 10 Min 35 Sek mehr Tageslicht als gestern")
});