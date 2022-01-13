import { ContentGenerator }  from '../../utils/contentGenerator';
import { parseISO, isAfter, isBefore } from 'date-fns'

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

describe("when calculating", () => {

  it('calculates correct daylight delta string in English', () => {
    const deltaResult = gen.daylightDelta(today, yesterday, "en")
    expect(deltaResult).toEqual("10 mins 35 secs")
  });
  
  it('calculates plurals correctly in English', () => {
  
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

});

describe("when calculating sunrise/sunset deltas", () => {

  describe("later in English", () => {

    it("calculates correct zero sunrise delta in English",  () => {
    // Today in Berlin the sun rose at 09:00:00, which is THE SAME AS yesterday.

    let zeroDeltaToday = {
      data: {
        results: {
          sunrise: "2022-01-08T00:00:00+00:00",
        }
      }
    }
  
    let zeroDeltaYesterday = {
      data: {
        results: {
          sunrise: "2022-01-07T00:00:00+00:00",
        }
      }
    }

    let result = gen.sunriseDelta(zeroDeltaToday, zeroDeltaYesterday, "en")
    expect(result).toEqual("the same as")
    })

    it("calculates correct 1 second later sunrise delta in English",  () => {
    // Today in Berlin the sun rose at 09:00:00, which is *1 second later than* yesterday.

    let oneSDeltaToday = {
      data: {
        results: {
          sunrise: "2022-01-08T00:00:01+00:00",
        }
      }
    }
  
    let oneSDeltaYesterday = {
      data: {
        results: {
          sunrise: "2022-01-07T00:00:00+00:00",
        }
      }
    }
    
    let result = gen.sunriseDelta(oneSDeltaToday, oneSDeltaYesterday, "en")
    expect(result).toEqual("1 second later")
    })

    it("calculates correct 10 secs later sunrise delta in English",  () => {
    // Today in Berlin the sun rose at 09:00:00, which is *1 second later than* yesterday.

    let oneSDeltaToday = {
      data: {
        results: {
          sunrise: "2022-01-08T00:00:10+00:00",
        }
      }
    }
  
    let oneSDeltaYesterday = {
      data: {
        results: {
          sunrise: "2022-01-07T00:00:00+00:00",
        }
      }
    }
    
    let result = gen.sunriseDelta(oneSDeltaToday, oneSDeltaYesterday, "en")
    expect(result).toEqual("10 seconds later")
    })

    it("calculates correct 1 minute later sunrise delta in English",  () => {
    let oneSDeltaToday = {
      data: {
        results: {
          sunrise: "2022-01-08T00:01:00+00:00",
        }
      }
    }
  
    let oneSDeltaYesterday = {
      data: {
        results: {
          sunrise: "2022-01-07T00:00:00+00:00",
        }
      }
    }
    
    let result = gen.sunriseDelta(oneSDeltaToday, oneSDeltaYesterday, "en")
    expect(result).toEqual("1 minute later")
    })

    it("calculates correct 10 min 10 secs later sunrise delta in English",  () => {
    let oneSDeltaToday = {
      data: {
        results: {
          sunrise: "2022-01-08T00:10:10+00:00",
        }
      }
    }
  
    let oneSDeltaYesterday = {
      data: {
        results: {
          sunrise: "2022-01-07T00:00:00+00:00",
        }
      }
    }
    
    let result = gen.sunriseDelta(oneSDeltaToday, oneSDeltaYesterday, "en")
    expect(result).toEqual("10 minutes 10 seconds later")
    })

  })

  describe("later in German", () => {

    it("calculates correct zero sunrise delta in German",  () => {
    // Today in Berlin the sun rose at 09:00:00, which is THE SAME AS yesterday.

    let zeroDeltaToday = {
      data: {
        results: {
          sunrise: "2022-01-08T00:00:00+00:00",
        }
      }
    }
  
    let zeroDeltaYesterday = {
      data: {
        results: {
          sunrise: "2022-01-07T00:00:00+00:00",
        }
      }
    }

    let result = gen.sunriseDelta(zeroDeltaToday, zeroDeltaYesterday, "de")
    expect(result).toEqual("das gleiche wie")
    })
  
    it("calculates correct 1 second later sunrise delta in German",  () => {
    // Today in Berlin the sun rose at 09:00:00, which is *1 second later than* yesterday.

    let oneSDeltaToday = {
      data: {
        results: {
          sunrise: "2022-01-08T00:00:01+00:00",
        }
      }
    }
  
    let oneSDeltaYesterday = {
      data: {
        results: {
          sunrise: "2022-01-07T00:00:00+00:00",
        }
      }
    }
    
    let result = gen.sunriseDelta(oneSDeltaToday, oneSDeltaYesterday, "de")
    expect(result).toEqual("1 Sekunde später")
    })
  
    it("calculates correct 10 secs later sunrise delta in German",  () => {
    // Today in Berlin the sun rose at 09:00:00, which is *1 second later than* yesterday.

    let oneSDeltaToday = {
      data: {
        results: {
          sunrise: "2022-01-08T00:00:10+00:00",
        }
      }
    }
  
    let oneSDeltaYesterday = {
      data: {
        results: {
          sunrise: "2022-01-07T00:00:00+00:00",
        }
      }
    }
    
    let result = gen.sunriseDelta(oneSDeltaToday, oneSDeltaYesterday, "de")
    expect(result).toEqual("10 Sekunden später")
    })
  
    it("calculates correct 1 minute later sunrise delta in German",  () => {
    let oneSDeltaToday = {
      data: {
        results: {
          sunrise: "2022-01-08T00:01:00+00:00",
        }
      }
    }
  
    let oneSDeltaYesterday = {
      data: {
        results: {
          sunrise: "2022-01-07T00:00:00+00:00",
        }
      }
    }
    
    let result = gen.sunriseDelta(oneSDeltaToday, oneSDeltaYesterday, "de")
    expect(result).toEqual("1 Minute später")
    })
  
    it("calculates correct 10 min 10 secs later sunrise delta in German",  () => {
    let oneSDeltaToday = {
      data: {
        results: {
          sunrise: "2022-01-08T00:10:10+00:00",
        }
      }
    }
  
    let oneSDeltaYesterday = {
      data: {
        results: {
          sunrise: "2022-01-07T00:00:00+00:00",
        }
      }
    }
    
    let result = gen.sunriseDelta(oneSDeltaToday, oneSDeltaYesterday, "de")
    expect(result).toEqual("10 Minuten 10 Sekunden später")
    })

  })

  describe("earlier in English", () => {

    it("calculates correct 1 second earlier sunrise delta in English",  () => {
    // Today in Berlin the sun rose at 09:00:00, which is *1 second later than* yesterday.

    let oneSDeltaToday = {
      data: {
        results: {
          sunrise: "2022-01-08T11:59:59",
        }
      }
    }
  
    let oneSDeltaYesterday = {
      data: {
        results: {
          sunrise: "2022-01-07T12:00:00",
        }
      }
    }
    
    let result = gen.sunriseDelta(oneSDeltaToday, oneSDeltaYesterday, "en")
    expect(result).toEqual("1 second earlier")
    })

    it("calculates correct 10 secs earlier sunrise delta in English",  () => {
    // Today in Berlin the sun rose at 09:00:00, which is *1 second later than* yesterday.

    let oneSDeltaToday = {
      data: {
        results: {
          sunrise: "2022-01-08T00:00:10+00:00",
        }
      }
    }
  
    let oneSDeltaYesterday = {
      data: {
        results: {
          sunrise: "2022-01-07T00:00:00+00:00",
        }
      }
    }
    
    let result = gen.sunriseDelta(oneSDeltaToday, oneSDeltaYesterday, "en")
    expect(result).toEqual("10 seconds earlier")
    })

    it("calculates correct 1 minute earlier sunrise delta in English",  () => {
    let oneSDeltaToday = {
      data: {
        results: {
          sunrise: "2022-01-08T00:01:00+00:00",
        }
      }
    }
  
    let oneSDeltaYesterday = {
      data: {
        results: {
          sunrise: "2022-01-07T00:00:00+00:00",
        }
      }
    }
    
    let result = gen.sunriseDelta(oneSDeltaToday, oneSDeltaYesterday, "en")
    expect(result).toEqual("1 minute earlier")
    })

    it("calculates correct 10 min 10 secs earlier sunrise delta in English",  () => {
    let oneSDeltaToday = {
      data: {
        results: {
          sunrise: "2022-01-08T00:10:10+00:00",
        }
      }
    }
  
    let oneSDeltaYesterday = {
      data: {
        results: {
          sunrise: "2022-01-07T00:00:00+00:00",
        }
      }
    }
    
    let result = gen.sunriseDelta(oneSDeltaToday, oneSDeltaYesterday, "en")
    expect(result).toEqual("10 minutes 10 seconds earlier")
    })

  }) 

  describe("earlier in German", () => {

    it("calculates correct 1 second earlier sunrise delta in German",  () => {
    // Today in Berlin the sun rose at 09:00:00, which is *1 second later than* yesterday.

    let oneSDeltaToday = {
      data: {
        results: {
          sunrise: "2022-01-08T00:59:59+00:00",
        }
      }
    }
  
    let oneSDeltaYesterday = {
      data: {
        results: {
          sunrise: "2022-01-07T01:00:00+00:00",
        }
      }
    }
    
    let result = gen.sunriseDelta(oneSDeltaToday, oneSDeltaYesterday, "de")
    expect(result).toEqual("1 Sekunde früher")
    })
  
    it("calculates correct 10 secs earlier sunrise delta in German",  () => {
    // Today in Berlin the sun rose at 09:00:00, which is *1 second later than* yesterday.

    let oneSDeltaToday = {
      data: {
        results: {
          sunrise: "2022-01-08T00:59:50+00:00",
        }
      }
    }
  
    let oneSDeltaYesterday = {
      data: {
        results: {
          sunrise: "2022-01-07T01:00:00+00:00",
        }
      }
    }
    
    let result = gen.sunriseDelta(oneSDeltaToday, oneSDeltaYesterday, "de")
    expect(result).toEqual("10 Sekunden früher")
    })
  
    it("calculates correct 1 minute earlier sunrise delta in German",  () => {
    let oneSDeltaToday = {
      data: {
        results: {
          sunrise: "2022-01-08T00:59:00+00:00",
        }
      }
    }
  
    let oneSDeltaYesterday = {
      data: {
        results: {
          sunrise: "2022-01-07T01:00:00+00:00",
        }
      }
    }
    
    let result = gen.sunriseDelta(oneSDeltaToday, oneSDeltaYesterday, "de")
    expect(result).toEqual("1 Minute früher")
    })
  
    it("calculates correct 10 min 10 secs earlier sunrise delta in German",  () => {
    let oneSDeltaToday = {
      data: {
        results: {
          sunrise: "2022-01-08T00:49:50+00:00",
        }
      }
    }
  
    let oneSDeltaYesterday = {
      data: {
        results: {
          sunrise: "2022-01-07T01:00:00+00:00",
        }
      }
    }
    
    let result = gen.sunriseDelta(oneSDeltaToday, oneSDeltaYesterday, "de")
    expect(result).toEqual("10 Minuten 10 Sekunden früher")
    })

  })  
})

describe("When calculating daylight hours", () => {

  it('calculates correct daylight hours in English', () => {

// 8 hours, 1 minute
let res8h1m = gen.calculateDaylight("2022-01-08T00:00:00+00:00", "2022-01-08T08:01:37+00:00", "en")
expect(res8h1m).toEqual("8 hours, 1 minute")

// 8 hours, 10 minutes
let res8h10m = gen.calculateDaylight("2022-01-08T00:00:00+00:00", "2022-01-08T08:10:37+00:00", "en")
expect(res8h10m).toEqual("8 hours, 10 minutes")
  });

  it('calculates correct daylight hours in German', () => {

// 8 hours, 1 minute
let res8h1m = gen.calculateDaylight("2022-01-08T00:00:00+00:00", "2022-01-08T08:01:37+00:00", "de")
expect(res8h1m).toEqual("8 Stunden, 1 Minute")

// 8 hours, 10 minutes
let res8h10m = gen.calculateDaylight("2022-01-08T00:00:00+00:00", "2022-01-08T08:10:37+00:00", "de")
expect(res8h10m).toEqual("8 Stunden, 10 Minuten")
  });

  it('converts UTCDateToLocalDate', () => {
let utcDate = "2022-01-08T00:00:00+00:00"
let convertedDate = gen.convertUTCDateToLocalDate(utcDate);
expect(convertedDate).toEqual("01:00:00")
  });

})

describe("When creating content", () => {

  const contentToday = {
    data: {
      results: {
        sunrise: "2022-01-09T08:00:00+00:00",
        sunset: "2022-01-09T18:01:02+00:00",
        day_length: 635
      },
      status: 'OK'
    },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {},
    request: {}
  }

  const contentYesterday = {
    data: {
      results: {
        sunrise: "2022-01-08T07:00:00+00:00",
        sunset: "2022-01-08T17:01:02+00:00",
        day_length: 0
      }
      ,
      status: 'OK'
    },
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {},
    request: {}
  }

  it('creates correct tense when tweet is posted after sunrise in English', () => {
    // sunrise at 2022-01-09T07:00:00+00:00, it run at 12h00
    let itDate = parseISO("2022-01-09T12:00:00+00:00")
    let sunrise = parseISO(contentToday.data.results.sunrise)
    let result = gen.parseSunriseData(contentToday, contentYesterday, "en", itDate)
    expect(result).toEqual("Today in Berlin the sun rose at 09:00:00 and will set 10 hours, 1 minute later at 19:01:02. There will be 10 mins 35 secs more daylight than yesterday")
  });

  it('creates correct tense when tweet is posted after sunrise in German', () => {
    // sunrise at 2022-01-09T07:00:00+00:00, it run at 10h00
    let itDate = parseISO("2022-01-09T10:00:00+00:00")
    let sunrise = parseISO(contentToday.data.results.sunrise)
    let result = gen.parseSunriseData(contentToday, contentYesterday, "de", itDate)
    expect(result).toEqual("Heute in Berlin hat die Sonne um 09:00:00 aufgegangen, und wird nach 10 Stunden, 1 Minute um 19:01:02 untergehen. Es wird 10 Min 35 Sek mehr Tageslicht als gestern")
  });

  it('creates correct tense when tweet is posted before sunrise in English', () => {
    // sunrise at 2022-01-09T07:00:00+00:00, it run at 03h00
    let itDate = parseISO("2022-01-09T03:00:00+00:00")
    let sunrise = parseISO(contentToday.data.results.sunrise)
    let result = gen.parseSunriseData(contentToday, contentYesterday, "en", itDate)
    expect(result).toEqual("Today in Berlin the sun will rise at 09:00:00 and will set 10 hours, 1 minute later at 19:01:02. There will be 10 mins 35 secs more daylight than yesterday")
  });

  it('creates correct tense when tweet is posted before sunrise in German', () => {
    // sunrise at 2022-01-09T07:00:00+00:00, it run at 03h00
    let itDate = parseISO("2022-01-09T03:00:00+00:00")
    let sunrise = parseISO(contentToday.data.results.sunrise)
    let result = gen.parseSunriseData(contentToday, contentYesterday, "de", itDate)
    expect(result).toEqual("Heute in Berlin geht die Sonne um 09:00:00 auf, und wird nach 10 Stunden, 1 Minute um 19:01:02 untergehen. Es wird 10 Min 35 Sek mehr Tageslicht als gestern")
  });

})