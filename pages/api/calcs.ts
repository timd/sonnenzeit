import { getSunrise, getSunset } from 'sunrise-sunset-js';
import { locationDb, checkCity, getLatLong, Location } from  '../../utils/latlong'

export default async function handler(req, res) {

  if (req.headers['x-api-token'] != process.env.SERVICE_ACCESSTOKEN) {
    return res.status(401).json('{error : "invalid token"}')
  }

  if (req.query['city']) {
    if (!checkCity(req.query['city'])) {
      return res.status(422).json('{error : "invalid city"}')  
    }
  } else {
    return res.status(422).json('{error : "invalid query"}')
  }

  let city = locationDb[req.query['city']]

  let calcDate: Date
  
  if (req.query['date']) {
    var timestamp = Date.parse(req.query['date']);
    if (isNaN(timestamp) == false) {
      calcDate = new Date(timestamp);
    } else {
      calcDate = new Date()
    }
  } else {
      calcDate = new Date()
      //return res.status(401).json({error: "invalid date format"})
  }

  const sunrise = getSunrise(city.lat, city.long, calcDate);
  const sunset = getSunset(city.lat, city.long, calcDate);
  
  console.log(`Sunrise: ${sunrise}`);
  console.log(`Sunrise: ${sunrise}`);
  return res.status(200).json( 
    {
      sunrise: sunrise,
      sunset: sunset
    }
  );

}
