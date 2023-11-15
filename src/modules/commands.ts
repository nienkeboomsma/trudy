import { tado, telegram, weather, SunTimes } from '../services'
import { settings } from '../config'

type SunTime = {
  title: string
  propertyName: keyof SunTimes
}

const sunTimeItems: Array<SunTime> = [
  { title: 'Dawn', propertyName: 'dawn' },
  { title: 'Screens down', propertyName: 'screensDown' },
  { title: 'Screens up', propertyName: 'screensUp' },
  { title: 'Dusk', propertyName: 'dusk' },
]

const winterTimeItems: Array<SunTime> = [
  { title: 'Dawn', propertyName: 'dawn' },
  { title: 'Dusk', propertyName: 'dusk' },
]

const wrapInCodeBlock = (str: string) => '```\n' + str + '```'

class Commands {
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

    const items =
      settings.updateFrequencies.screens.checkSunTimes === 0
        ? winterTimeItems
        : sunTimeItems

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
}

export default new Commands()
