import { tado, telegram, weather } from '../services'

class Commands {
  sendTemperatures() {
    const zoneStrings = tado.zones.map(
      (zone) => `${zone.name.padEnd(14, ' ')}${zone.temperature}`
    )

    let averageTempString = ''

    if (tado.averageTemp !== null) {
      averageTempString =
        tado.averageTemp > weather.weather.temperature
          ? "It's currently warmer indoors 🌙"
          : "It's currently warmer outdoors ☀️"
    }

    const message = `\`\`\`
Outdoors      ${weather.weather.temperature}

${zoneStrings.join('\n')}

${averageTempString}
\`\`\``

    telegram.sendMessage(message, { markdown: true })
  }

  temps() {
    telegram.listenFor(/\/temps/, this.sendTemperatures)
  }
}
export default new Commands()
