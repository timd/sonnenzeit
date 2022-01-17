export interface Location {
  name: string,
  timezone: string,
  twitter: string,
  language: string,
  lat: number, 
  long: number,
  locale: string
};

export const locationDb: Record<string, Location> = {
  'BER': { name: "Berlin", timezone: "Europe/Berlin", twitter: "sonnezeitberlin", language: "de", lat: 52.51703, long: 13.38885, locale:"de" },
  'BER-EN': { name: "Berlin", timezone: "Europe/Berlin", twitter: "berlindaylight", language: "en", lat: 52.51703, long: 13.38885, locale:"enGB" },
  'NYC': { name: "New York City", timezone: "America/New_York", twitter: "daylightinnyc", language: "en", lat: 40.77813, long: -73.96866, locale:"enGB" },
  'SFO': { name: "San Francisco", timezone: "America/Los_Angeles", twitter: "daylightinsf", language: "en", lat: 37.82116, long: -122.47811, locale:"enGB" },
  'LON': { name: "London", timezone: "Europe/London", twitter: "daylightlondon", lat: 51.50975, language: "en", long: -0.12666, locale:"enGB" },
}

function getLatLong(city: string): Location {
  return locationDb[city]
}

function checkCity(city: string): boolean {
  return (locationDb.hasOwnProperty(city))
}

export { getLatLong, checkCity }