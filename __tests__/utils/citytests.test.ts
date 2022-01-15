import { ContentGenerator } from '../../utils/contentGenerator';
import { parseISO, isAfter, isBefore } from 'date-fns'
import { createMocks } from 'node-mocks-http';
import { Location, getLatLong } from  '../../utils/latlong'


const gen = new ContentGenerator();

describe('When tweeting as a new city', () => {
  
  it('uses the correct lat/long based on the city', async () => {

    const cities: Record<string, Location> = {
      'BER': { lat: 52.51703, long: 13.38885 },
      'NYC': { lat: 40.77813, long: -73.96866 }
    }

    for (const [city, pair] of Object.entries(cities)) {
      const result = getLatLong(city)
      const expectedResult = { lat: pair.lat, long: pair.long }
      expect(result).toEqual(expectedResult)
    }
    
  });

});