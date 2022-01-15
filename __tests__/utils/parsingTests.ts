import { ContentGenerator }  from '../../utils/contentGenerator';
import { parseISO, isAfter, isBefore, differenceInDays } from 'date-fns'
import { enGB, de } from 'date-fns/locale'

const gen = new ContentGenerator();

const yesterday = {
  data: {
    results: {
      sunrise: "2022-01-08T07:00:00+00:00",
      sunset: "2022-01-08T17:01:02+00:00",
      day_length: 0,
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
		  day_length: 635,
    },
    status: 'OK'
  },
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {},
  request: {}
}

describe("when parsing", () => {

  it('returns 2 results', () => {
    const results = gen.createNormalisedTimes(today, yesterday)
    expect(results.length).toEqual(2)
  });

  it('calculates correct daylight delta string in English', () => {
    const results = gen.createNormalisedTimes(today, yesterday)
    const tday = results[0]
    const yday = results[1]
    
    console.log(today);
    console.log(tday);

    const daysDiff = differenceInDays(tday, new Date('2022-01-01'));

    expect(daysDiff).toEqual(0)

  });

});
