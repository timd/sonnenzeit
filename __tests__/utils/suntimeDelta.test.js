import { ContentGenerator }  from '../../utils/contentGenerator';
import { parseISO, isAfter, isBefore } from 'date-fns'

const gen = new ContentGenerator();

const yesterday = {
  data: {
    results: {
      sunrise: "2022-01-08T08:30:00+00:00",
      sunset: "2022-01-08T17:30:00+00:00",
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
      sunrise: "2022-01-09T08:20:00+00:00",
		  sunset: "2022-01-09T17:20:00+00:00",
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

describe('When calculating the increase/decrease in sunrise time', () => {

  describe("in English", () => {

    it('should correctly calulate an earlier sunrise', () => {
      const test_tday = {
        data: {
          results: { sunrise: "2022-01-08T08:09:00+00:00", sunset: "2022-01-08T19:11:00+00:00" }
        }
      }
		  
      const test_yday = {
        data: {
          results: { sunrise: "2022-01-07T08:10:30+00:00", sunset: "2022-01-07T19:11:05+00:00" }
        }
      }
      
      expect(gen.calculateSunDelta(test_tday, test_yday, "en").sunriseDelta).toEqual("1 min 30 secs earlier");
    })


    it('should correctly calulate an later sunrise', () => {
      // 10m 10s earlier
      const test_tday = {
        data: {
          results: { sunrise: "2022-01-08T08:10:10+00:00", sunset: "2022-01-08T19:00:00+00:00" }
        }
      }
		  
      const test_yday = {
        data: {
          results: { sunrise: "2022-01-07T08:00:00+00:00", sunset: "2022-01-07T19:10:10+00:00" }
        }
      }

      expect(gen.calculateSunDelta(test_tday, test_yday, "en").sunriseDelta).toEqual("10 min 10 secs later");
    })

    it('should correctly calulate an earlier sunrise', () => {
      const test_tday = {
        data: {
          results: { sunrise: "2022-01-08T08:00:05+00:00", sunset: "2022-01-08T19:10:00+00:00" }
        }
      }
		  
      const test_yday = {
        data: {
          results: { sunrise: "2022-01-07T08:05:00+00:00", sunset: "2022-01-07T19:11:05+00:00" }
        }
      }
      
      expect(gen.calculateSunDelta(test_tday, test_yday, "en").sunriseDelta).toEqual("1 min 5 secs earlier");
    })

    it('should correctly calulate an later sunset', () => {
      // 10m 10s earlier
      const test_tday = {
        data: {
          results: { sunrise: "2022-01-08T08:10:10+00:00", sunset: "2022-01-08T19:10:20+00:00" }
        }
      }
		  
      const test_yday = {
        data: {
          results: { sunrise: "2022-01-07T08:00:00+00:00", sunset: "2022-01-07T19:00:00+00:00" }
        }
      }

      expect(gen.calculateSunDelta(test_tday, test_yday, "en").sunsetDelta).toEqual("10 min 20 secs later");

    })

    it('should correctly calulate an earlier sunset', () => {
      const test_tday = {
        data: {
          results: { sunrise: "2022-01-08T08:00:05+00:00", sunset: "2022-01-08T19:15:05+00:00" }
        }
      }
		  
      const test_yday = {
        data: {
          results: { sunrise: "2022-01-07T08:05:00+00:00", sunset: "2022-01-07T19:20:00+00:00" }
        }
      }
      
      console.log(gen.calculateSunDelta(test_tday, test_yday, "en"))
      expect(gen.calculateSunDelta(test_tday, test_yday, "en").sunsetDelta).toEqual("5 min 5 secs earlier");
    })

    })

})