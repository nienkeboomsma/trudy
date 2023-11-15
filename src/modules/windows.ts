import { tado, telegram, weather } from '../services'

class Windows {
  private windowsOpen: boolean = false

  private toggleWindows() {
    telegram.sendMessage(
      this.windowsOpen ? '🔥 Close the windows! 🔥' : '❄️ Open the windows! ❄️'
    )
    this.windowsOpen = !this.windowsOpen
  }

  private checkTemperatures() {
    const averageIndoorTemp = tado.getAverageTemp()
    const outdoorTemp = weather.getTemperature()

    if (!averageIndoorTemp) {
      console.log(
        new Date(),
        'Windows: Failed to check temperatures, because the average temperature is not defined'
      )
      return
    }
    if (!outdoorTemp) {
      console.log(
        new Date(),
        'Windows: Failed to check temperatures, because the outdoor temperature is not defined'
      )
      return
    }

    const warmerIndoors = averageIndoorTemp > outdoorTemp

    if (
      (warmerIndoors && !this.windowsOpen) ||
      (!warmerIndoors && this.windowsOpen)
    ) {
      console.log(
        new Date(),
        `Windows: It is ${averageIndoorTemp}°C indoors and ${outdoorTemp}°C outdoors; time to ${
          this.windowsOpen ? 'close' : 'open'
        } the windows`
      )
      this.toggleWindows()
    }
  }

  public initiate(interval: number) {
    if (interval > 0) {
      this.checkTemperatures()
      setInterval(() => this.checkTemperatures(), interval)
    }
  }
}

export default new Windows()
