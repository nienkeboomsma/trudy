import SunCalc from 'suncalc'
import { constants, settings } from '../config'

interface WeatherOptions {
  latitude: number
  longitude: number
  weerliveKey: string
}

interface WeatherType {
  temperature: number
  wind: number
  rain: Record<string, number>[]
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

  sunTimes: Record<string, Date> = {}
  weather: WeatherType = {} as WeatherType

  async updateTempAndWind() {
    try {
      const res = await fetch(
        `https://weerlive.nl/api/json-data-10min.php?key=${this.weerliveKey}&locatie=${this.latitude},${this.longitude}`
      )
      const data = await res.json()

      this.weather.temperature = data.liveweer[0].temp
      this.weather.wind = data.liveweer[0].windkmh
      console.log('Weather: Updated temperature and wind speed')
    } catch (err) {
      console.log('Weather: Failed to get temperature and wind', err)
    }
  }

  async updateRainForecast() {
    try {
      const res = await fetch(
        `https://gpsgadget.buienradar.nl/data/raintext/?lat=${this.latitude}&lon=${this.longitude}`
      )
      const data = await res.text()
      const cleanData = data
        .split(/\r\n/)
        .map((e, index) => {
          return { minutesFromNow: index * 5, rain: Number(e.split('|')[0]) }
        })
        .slice(0, -1)

      this.weather.rain = cleanData
      console.log('Weather: Updated rain forecast')
    } catch (err) {
      console.log('Weather: Failed to get rain forecast', err)
    }
  }

  getAzimuthByTime(timeAndDate: Date) {
    const azimuth = SunCalc.getPosition(
      timeAndDate,
      this.latitude,
      this.longitude
    ).azimuth
    return azimuth * (180 / Math.PI) + 180
  }

  getTimeByAzimuth(desiredAzimuth: number) {
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

  updateSunTimes() {
    const currentDate = new Date()

    if (this.sunTimes.lastUpdated?.getDate() === currentDate.getDate()) return

    this.sunTimes.dawn = SunCalc.getTimes(
      currentDate,
      this.latitude,
      this.longitude
    ).dawn
    this.sunTimes.screensDown = this.getTimeByAzimuth(settings.morningAzimuth)
    this.sunTimes.screensUp = this.getTimeByAzimuth(settings.eveningAzimuth)
    this.sunTimes.dusk = SunCalc.getTimes(
      currentDate,
      this.latitude,
      this.longitude
    ).dusk
    this.sunTimes.lastUpdated = currentDate

    console.log('Weather: Updated sun times')
  }
}

export default new Weather({
  latitude: constants.LATITUDE,
  longitude: constants.LONGITUDE,
  weerliveKey: constants.WEERLIVE_KEY,
})
