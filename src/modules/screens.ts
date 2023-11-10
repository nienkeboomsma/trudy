import { telegram, weather } from '../services'
import { scheduledMessages } from '../modules'
import { settings } from '../config'

class Screens {
  screensDown: boolean = false

  toggleScreens() {
    telegram.sendMessage(
      this.screensDown
        ? '🌙 Put the screens up! 🌙'
        : '☀️ Put the screens down! ☀️'
    )
    this.screensDown = !this.screensDown
  }

  checkSunTimes() {
    if (!weather.sunTimes) {
      console.log(
        new Date(),
        'Screens: Failed to check screens, because sun times are not defined'
      )
      return
    }

    const now = new Date()

    const screenShouldGoDown =
      weather.sunTimes.screensDown < now &&
      now < weather.sunTimes.screensUp &&
      !this.screensDown &&
      !this.determineRain() &&
      !this.determineWind()
    const screenShouldGoUp =
      weather.sunTimes.screensUp < now && this.screensDown

    if (screenShouldGoDown || screenShouldGoUp) {
      console.log(
        new Date(),
        `Screens: It is time to put the screens ${
          this.screensDown ? 'up' : 'down'
        }`
      )
      this.toggleScreens()
    }
  }

  determineWind() {
    if (!weather.wind) return null

    const windy = weather.wind > settings.screens.maxAcceptableWind
    return windy
  }

  determineRain() {
    if (!weather.rain) return null

    const nextHour = weather.rain.slice(0, 12)
    const rainInNextHour = nextHour.filter((e) => e.intensity > 0).length > 0
    return rainInNextHour
  }

  checkWindAndRain() {
    if (!this.screensDown) return

    const rainy = this.determineRain()
    const windy = this.determineWind()

    if (rainy === null || windy === null) {
      console.log(
        new Date(),
        'Screens: Failed to check for wind or rain, because wind or rain data is not defined'
      )
      return
    }

    if (rainy || windy) {
      console.log(
        new Date(),
        `Screens: It is ${
          rainy ? 'rainy' : 'windy'
        }, time to put the screens up`
      )

      const message = rainy
        ? '🌧️ Put the screens up! 🌧️'
        : '💨 Put the screens up! 💨'
      telegram.sendMessage(message)

      this.screensDown = false
    }
  }

  async initiate(intervals: {
    checkSunTimes: number
    checkWindAndRain: number
  }) {
    if (intervals.checkSunTimes > 0) {
      this.checkSunTimes()
      setInterval(() => this.checkSunTimes(), intervals.checkSunTimes)

      if (intervals.checkWindAndRain > 0) {
        this.checkWindAndRain()
        setInterval(() => this.checkWindAndRain(), intervals.checkWindAndRain)
      }
    }
  }
}

export default new Screens()
