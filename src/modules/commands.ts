import { screens, windows } from '../modules'
import { tado, telegram, weather, RainEntry, SunTimes } from '../services'
import { settings } from '../config'

type SunTime = {
  title: string
  propertyName: keyof SunTimes
}

const heatWaveOnItems: Array<SunTime> = [
  { title: 'Dawn', propertyName: 'dawn' },
  { title: 'Screens down', propertyName: 'screensDown' },
  { title: 'Screens up', propertyName: 'screensUp' },
  { title: 'Dusk', propertyName: 'dusk' },
]

const heatWaveOffItems: Array<SunTime> = [
  { title: 'Dawn', propertyName: 'dawn' },
  { title: 'Dusk', propertyName: 'dusk' },
]

const wrapInCodeBlock = (str: string) => '```\n' + str + '```'

class Commands {
  private sendRain() {
    const rain = weather.getRain()

    if (!rain) {
      console.log(
        new Date(),
        'Commands: could not send rain predictions, because they are not defined'
      )
      return
    }

    if (rain.every((item) => item.intensity === 0)) {
      telegram.sendMessage('No rain in the next two hours!')
      return
    }

    const getRoundedCurrentTime = () => {
      const now = new Date()
      const minutesPastTheHour = now.getMinutes()
      const roundedMinutes = Math.ceil(minutesPastTheHour / 5) * 5
      return now.setMinutes(roundedMinutes)
    }

    const now = getRoundedCurrentTime()

    const convertTimestamp = (minutesFromNow: number): string => {
      return new Date(
        now.valueOf() + minutesFromNow * 60000
      ).toLocaleTimeString('en-NL', { hour: '2-digit', minute: '2-digit' })
    }

    const emojifyIntensity = (intensity: number): string => {
      if (intensity === 0) return ''
      if (intensity < 85) return '💧'
      if (intensity < 170) return '💧💧'
      return '💧💧💧'
    }

    const createRainString = (line: RainEntry) => {
      return (
        convertTimestamp(line.minutesFromNow) +
        '   ' +
        emojifyIntensity(line.intensity) +
        '\n'
      )
    }

    const message = wrapInCodeBlock(
      rain.map((item) => createRainString(item)).join('')
    )

    telegram.sendMessage(message, { markdown: true })
  }

  public rain() {
    telegram.listenFor(/\/rain/, this.sendRain)
  }

  private sendSunTimes() {
    const sunTimes = weather.getSunTimes()

    if (!sunTimes) {
      console.log(
        new Date(),
        'Commands: could not send sun times, because they are not defined'
      )
      return
    }

    const createSunTimeString = (line: SunTime) => {
      return (
        line.title.padEnd(14, ' ') +
        sunTimes[line.propertyName].toLocaleTimeString('en-NL') +
        '\n'
      )
    }

    const items = screens.getActivationStatus()
      ? heatWaveOnItems
      : heatWaveOffItems

    const message = wrapInCodeBlock(
      items.map((item) => createSunTimeString(item)).join('')
    )

    telegram.sendMessage(message, { markdown: true })
  }

  public sun() {
    telegram.listenFor(/\/sun/, this.sendSunTimes)
  }

  private sendTemperatures() {
    const zones = tado.getZones()
    const zoneStrings = zones.map(
      (zone) => `${zone.name.padEnd(14, ' ')}${zone.temperature}`
    )

    const averageIndoorTemp = tado.getAverageTemp()
    const outdoorTemp = weather.getTemperature()
    let averageTempString = ''

    if (averageIndoorTemp && outdoorTemp) {
      averageTempString =
        averageIndoorTemp > outdoorTemp
          ? "\n\nIt's currently warmer indoors 🌙"
          : "\n\nIt's currently warmer outdoors ☀️"
    }

    const message = wrapInCodeBlock(
      `Outdoors      ${outdoorTemp}

${zoneStrings.join('\n')}${averageTempString}`
    )

    telegram.sendMessage(message, { markdown: true })
  }

  public temps() {
    telegram.listenFor(/\/temps/, this.sendTemperatures)
  }

  private startHeatwaveMode() {
    screens.activate()
    windows.activate()
    telegram.sendMessage('Heatwave mode activated')
  }

  public heatwaveOn() {
    telegram.listenFor(/\/heatwave\son/, this.startHeatwaveMode)
  }

  private endHeatwaveMode() {
    screens.deactivate()
    windows.deactivate()
    telegram.sendMessage('Heatwave mode deactivated')
  }

  public heatwaveOff() {
    telegram.listenFor(/\/heatwave\soff/, this.endHeatwaveMode)
  }

  private sendHelp() {
    const message = `
\`/temps\`
Show current temperatures

\`/rain\`
Show rain forecast

\`/sun\`
Show sun times

\`/heatwave [on/off]\`
Turn heatwave mode on or off
    `

    telegram.sendMessage(message, { markdown: true })
  }

  public help() {
    telegram.listenFor(/\/help/, this.sendHelp)
  }
}

export default new Commands()
