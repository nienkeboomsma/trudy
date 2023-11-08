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
    if (!tado.averageTemp) {
      console.log(
        new Date(),
        'Windows: Failed to check temperatures, because the average temperature is not defined'
      )
      return
    }
    if (!weather.temperature) {
      console.log(
        new Date(),
        'Windows: Failed to check temperatures, because the outdoor temperature is not defined'
      )
      return
    }

    const warmerIndoors = tado.averageTemp > weather.temperature

    if (
      (warmerIndoors && !this.windowsOpen) ||
      (!warmerIndoors && this.windowsOpen)
    ) {
      console.log(
        new Date(),
        `Windows: It is ${tado.averageTemp}°C indoors and ${
          weather.temperature
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
