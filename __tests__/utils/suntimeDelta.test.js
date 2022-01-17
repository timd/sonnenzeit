import { ContentGenerator }  from '../../utils/contentGenerator';
import { parseISO, isAfter, isBefore } from 'date-fns'

const gen = new ContentGenerator();

describe('When calculating the increase/decrease in sunrise time', () => {

  describe("in English", () => {

    it('should correctly calulate an earlier sunrise', () => {
      const test_tday = {
        data: {
          results: { sunrise: "2022-01-08T08:10:00+00:00", sunset: "2022-01-08T19:11:00+00:00" }
        }
      }
		  
      const test_yday = {
        data: {
          results: { sunrise: "2022-01-07T08:11:30+00:00", sunset: "2022-01-07T19:11:05+00:00" }
        }
      }
      
      expect(gen.calculateSunDelta(test_tday, test_yday, "en").sunriseDelta).toEqual("1 min 30 secs earlier");
    })

    it('should correctly calulate an later sunrise', () => {
      const test_tday = {
        data: {
          results: { sunrise: "2022-01-08T08:10:11+00:00", sunset: "2022-01-08T19:00:00+00:00" }
        }
      }
		  
      const test_yday = {
        data: {
          results: { sunrise: "2022-01-07T08:00:00+00:00", sunset: "2022-01-07T19:10:00+00:00" }
        }
      }

      expect(gen.calculateSunDelta(test_tday, test_yday, "en").sunriseDelta).toEqual("10 min 11 secs later");
    })

    it('should correctly calulate an earlier sunset', () => {
      const test_tday = {
        data: {
          results: { sunrise: "2022-01-08T08:00:00+00:00", sunset: "2022-01-08T19:10:00+00:00" }
        }
      }
		  
      const test_yday = {
        data: {
          results: { sunrise: "2022-01-07T08:10:00+00:00", sunset: "2022-01-07T19:20:30+00:00" }
        }
      }
      
      expect(gen.calculateSunDelta(test_tday, test_yday, "en").sunsetDelta).toEqual("10 min 30 secs earlier");
    })

    it('should correctly calulate an later sunset', () => {
      const test_tday = {
        data: {
          results: { sunrise: "2022-01-08T08:10:00+00:00", sunset: "2022-01-08T19:10:20+00:00" }
        }
      }
		  
      const test_yday = {
        data: {
          results: { sunrise: "2022-01-07T08:00:00+00:00", sunset: "2022-01-07T19:00:00+00:00" }
        }
      }

      expect(gen.calculateSunDelta(test_tday, test_yday, "en").sunsetDelta).toEqual("10 min 20 secs later");

    })

  })

  describe("in German", () => {

    it('should correctly calulate an earlier sunrise', () => {
      const test_tday = {
        data: {
          results: { sunrise: "2022-01-08T08:10:00+00:00", sunset: "2022-01-08T19:11:00+00:00" }
        }
      }
		  
      const test_yday = {
        data: {
          results: { sunrise: "2022-01-07T08:11:30+00:00", sunset: "2022-01-07T19:11:05+00:00" }
        }
      }
      
      expect(gen.calculateSunDelta(test_tday, test_yday, "de").sunriseDelta).toEqual("1 Min 30 Sek früher");
    })

    it('should correctly calulate an later sunrise', () => {
      const test_tday = {
        data: {
          results: { sunrise: "2022-01-08T08:10:11+00:00", sunset: "2022-01-08T19:00:00+00:00" }
        }
      }
		  
      const test_yday = {
        data: {
          results: { sunrise: "2022-01-07T08:00:00+00:00", sunset: "2022-01-07T19:10:00+00:00" }
        }
      }

      expect(gen.calculateSunDelta(test_tday, test_yday, "de").sunriseDelta).toEqual("10 Min 11 Sek später");
    })

    it('should correctly calulate an earlier sunset', () => {
      const test_tday = {
        data: {
          results: { sunrise: "2022-01-08T08:00:00+00:00", sunset: "2022-01-08T19:10:00+00:00" }
        }
      }
		  
      const test_yday = {
        data: {
          results: { sunrise: "2022-01-07T08:10:00+00:00", sunset: "2022-01-07T19:20:30+00:00" }
        }
      }
      
      expect(gen.calculateSunDelta(test_tday, test_yday, "de").sunsetDelta).toEqual("10 Min 30 Sek früher");
    })

    it('should correctly calulate an later sunset', () => {
      const test_tday = {
        data: {
          results: { sunrise: "2022-01-08T08:10:00+00:00", sunset: "2022-01-08T19:10:20+00:00" }
        }
      }
		  
      const test_yday = {
        data: {
          results: { sunrise: "2022-01-07T08:00:00+00:00", sunset: "2022-01-07T19:00:00+00:00" }
        }
      }

      expect(gen.calculateSunDelta(test_tday, test_yday, "de").sunsetDelta).toEqual("10 Min 20 Sek später");

    })

  })

})