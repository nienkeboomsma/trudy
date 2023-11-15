import SunCalc from 'suncalc'
import { constants, settings } from '../config'

interface WeatherOptions {
  latitude: number
  longitude: number
  weerliveKey: string
}

export interface SunTimes {
  dawn: Date
  screensDown: Date
  screensUp: Date
  dusk: Date
}

interface RainEntry {
  readonly minutesFromNow: number
  readonly intensity: number
}

class Weather {
  private latitude: number
  private longitude: number
  private weerliveKey: string

  constructor(options: WeatherOptions) {
    this.latitude = options.latitude
    this.longitude = options.longitude
    this.weerliveKey = options.weerliveKey
  }

  private sunTimes?: SunTimes
  private temperature?: number
  private wind?: number
  private rain?: Array<RainEntry>

  public getSunTimes(): Readonly<SunTimes> | undefined {
    return this.sunTimes
  }

  public getTemperature() {
    return this.temperature
  }

  public getWind() {
    return this.wind
  }

  public getRain(): ReadonlyArray<RainEntry> | undefined {
    return this.rain
  }

  private async updateTempAndWind() {
    try {
      const res = await fetch(
        `https://weerlive.nl/api/json-data-10min.php?key=${this.weerliveKey}&locatie=${this.latitude},${this.longitude}`
      )
      const data = await res.json()

      this.temperature = data.liveweer[0].temp
      this.wind = data.liveweer[0].windkmh
      console.log(new Date(), 'Weather: Updated temperature and wind speed')
    } catch (err) {
      console.log(
        new Date(),
        'Weather: Failed to update temperature and wind speed',
        err
      )
    }
  }

  private async updateRainForecast() {
    try {
      const res = await fetch(
        `https://gpsgadget.buienradar.nl/data/raintext/?lat=${this.latitude}&lon=${this.longitude}`
      )
      const data = await res.text()
      const cleanData = data
        .split(/\r\n/)
        .map((e, index) => {
          return {
            minutesFromNow: index * 5,
            intensity: Number(e.split('|')[0]),
          }
        })
        .slice(0, -1)

      this.rain = cleanData
      console.log(new Date(), 'Weather: Updated rain forecast')
    } catch (err) {
      console.log(new Date(), 'Weather: Failed to update rain forecast', err)
    }
  }

  private getAzimuthByTime(timeAndDate: Date) {
    const azimuth = SunCalc.getPosition(
      timeAndDate,
      this.latitude,
      this.longitude
    ).azimuth
    return azimuth * (180 / Math.PI) + 180
  }

  private getTimeByAzimuth(desiredAzimuth: number) {
    const timeToCheck = new Date()
    timeToCheck.setHours(10)
    timeToCheck.setMinutes(0)

    let azimuth = 0

    while (azimuth < desiredAzimuth) {
      azimuth = this.getAzimuthByTime(timeToCheck)
      timeToCheck.setMinutes(timeToCheck.getMinutes() + 1)
    }

    return timeToCheck
  }

  private updateSunTimes() {
    const currentDate = new Date()

    if (this.sunTimes?.dawn?.getDate() === currentDate.getDate()) return

    const dawn = SunCalc.getTimes(
      currentDate,
      this.latitude,
      this.longitude
    ).dawn
    const screensDown = this.getTimeByAzimuth(settings.screens.morningAzimuth)
    const screensUp = this.getTimeByAzimuth(settings.screens.eveningAzimuth)
    const dusk = SunCalc.getTimes(
      currentDate,
      this.latitude,
      this.longitude
    ).dusk

    this.sunTimes = {
      dawn,
      screensDown,
      screensUp,
      dusk,
    }

    console.log(new Date(), 'Weather: Updated sun times')
  }

  public async initiate(intervals: {
    updateSunTimes: number
    updateRainForecast: number
    updateTempAndWind: number
  }) {
    if (intervals.updateSunTimes > 0) {
      this.updateSunTimes()
      setInterval(() => this.updateSunTimes(), intervals.updateSunTimes)
    }

    if (intervals.updateRainForecast > 0) {
      await this.updateRainForecast()
      setInterval(
        async () => await this.updateRainForecast(),
        intervals.updateRainForecast
      )
    }

    if (intervals.updateTempAndWind > 0) {
      await this.updateTempAndWind()
      setInterval(
        async () => await this.updateTempAndWind(),
        intervals.updateTempAndWind
      )
    }
  }
}

export default new Weather({
  latitude: constants.LATITUDE,
  longitude: constants.LONGITUDE,
  weerliveKey: constants.WEERLIVE_KEY,
})
