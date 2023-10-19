import { tado, telegram, weather } from '../services'

class Windows {
  windowsOpen: boolean = false

  toggleWindows() {
    telegram.sendMessage(
      this.windowsOpen ? '☀️ Close the windows! ☀️' : '🌙 Open the windows! 🌙'
    )
    this.windowsOpen = !this.windowsOpen
  }

  compareTemperatures() {
    const warmerIndoors =
      tado.temperatures.average > weather.weather.temperature

    if (
      (warmerIndoors && !this.windowsOpen) ||
      (!warmerIndoors && this.windowsOpen)
    ) {
      console.log(
        new Date(),
        `Windows: It is ${tado.temperatures.average}°C indoors and ${
          weather.weather.temperature
        }°C outdoors; time to ${
          this.windowsOpen ? 'close' : 'open'
        } the windows`
      )
      this.toggleWindows()
    }
  }

  initiate(interval: number) {
    if (interval > 0) {
      this.compareTemperatures()
      setInterval(() => this.compareTemperatures(), interval)
    }
  }
}

export default new Windows()
