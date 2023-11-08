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
  sendSunTimes() {
    if (!weather.sunTimes) {
      console.log(
        new Date(),
        'Commands: could not send sun times, because they are not defined'
      )
      return
    }

    const createSunTimeString = (line: SunTime) => {
      return (
        line.title.padEnd(14, ' ') +
        weather.sunTimes?.[line.propertyName].toLocaleTimeString('en-GB') +
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

  sun() {
    telegram.listenFor(/\/sun/, this.sendSunTimes)
  }

  sendTemperatures() {
    const zoneStrings = tado.zones.map(
      (zone) => `${zone.name.padEnd(14, ' ')}${zone.temperature}`
    )

    let averageTempString = ''

    if (tado.averageTemp && weather.temperature) {
      averageTempString =
        tado.averageTemp > weather.temperature
          ? "\n\nIt's currently warmer indoors 🌙"
          : "\n\nIt's currently warmer outdoors ☀️"
    }

    const message = wrapInCodeBlock(
      `Outdoors      ${weather.temperature}

${zoneStrings.join('\n')}${averageTempString}`
    )

    telegram.sendMessage(message, { markdown: true })
  }

  temps() {
    telegram.listenFor(/\/temps/, this.sendTemperatures)
  }
}
export default new Commands()
