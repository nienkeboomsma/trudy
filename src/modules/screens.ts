import { telegram, weather } from '../services'
import { scheduledMessages } from '../modules'
import { settings } from '../config'

class Screens {
  private moduleIsActivated: boolean = false
  private screensDown: boolean = false

  public activate() {
    this.moduleIsActivated = true
  }

  public deactivate() {
    this.moduleIsActivated = false
  }

  private toggleScreens() {
    telegram.sendMessage(
      this.screensDown
        ? '🌙 Put the screens up! 🌙'
        : '☀️ Put the screens down! ☀️'
    )
    this.screensDown = !this.screensDown
  }

  private checkSunTimes() {
    if (!this.moduleIsActivated) return

    const sunTimes = weather.getSunTimes()

    if (!sunTimes) {
      console.log(
        new Date(),
        'Screens: Failed to check screens, because sun times are not defined'
      )
      return
    }

    const now = new Date()

    const screenShouldGoDown =
      sunTimes.screensDown < now &&
      now < sunTimes.screensUp &&
      !this.screensDown &&
      !this.determineRain() &&
      !this.determineWind()
    const screenShouldGoUp = sunTimes.screensUp < now && this.screensDown

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

  private determineWind() {
    const wind = weather.getWind()

    if (!wind) return null

    const windy = wind > settings.screens.maxAcceptableWind
    return windy
  }

  private determineRain() {
    const rain = weather.getRain()

    if (!rain) return null

    const nextHour = rain.slice(0, 12)
    const rainInNextHour = nextHour.filter((e) => e.intensity > 0).length > 0
    return rainInNextHour
  }

  private checkWindAndRain() {
    if (!this.moduleIsActivated) return
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

  public async initiate(intervals: {
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
