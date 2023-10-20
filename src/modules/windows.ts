import { tado, telegram, weather } from '../services'

class Windows {
  windowsOpen: boolean = false

  toggleWindows() {
    telegram.sendMessage(
      this.windowsOpen ? '🔥 Close the windows! 🔥' : '❄️ Open the windows! ❄️'
    )
    this.windowsOpen = !this.windowsOpen
  }

  checkTemperatures() {
    if (tado.averageTemp === null) {
      console.log(
        new Date(),
        'Windows: Failed to check temperatures, because the average temperature is null'
      )
      return
    }

    const warmerIndoors = tado.averageTemp > weather.weather.temperature

    if (
      (warmerIndoors && !this.windowsOpen) ||
      (!warmerIndoors && this.windowsOpen)
    ) {
      console.log(
        new Date(),
        `Windows: It is ${tado.averageTemp}°C indoors and ${
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
      this.checkTemperatures()
      setInterval(() => this.checkTemperatures(), interval)
    }
  }
}

export default new Windows()
