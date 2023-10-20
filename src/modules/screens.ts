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
    const now = new Date()

    if (
      (weather.sunTimes.screensDown < now &&
        !this.screensDown &&
        !this.determineRain() &&
        !this.determineWind()) ||
      (weather.sunTimes.screensUp < now && this.screensDown)
    ) {
      console.log(
        new Date(),
        `Screens: It is time to put the screens ${
          this.screensDown ? 'up' : 'down'
        }`
      )
      this.toggleScreens()
    }
  }

  determineRain() {
    const windy = weather.weather.wind > settings.screens.maxAcceptableWind
    return windy
  }

  determineWind() {
    const rainy = [1, 2].every(
      (e) =>
        weather.weather.rain[e].intensity > settings.screens.maxAcceptableRain
    )
    return rainy
  }

  checkWindAndRain() {
    if (!this.screensDown) return

    const rainy = this.determineRain()
    const windy = this.determineWind()

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
