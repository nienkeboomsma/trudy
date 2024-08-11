import 'dotenv/config'
import { tado, weather } from './services'
import { windows, scheduledMessages, screens, commands } from './modules'
import { settings } from './config'

const startApp = async () => {
  await tado.initiate(settings.updateFrequencies.tado.updateIndoorTemps)

  await weather.initiate({
    updateSunTimes: settings.updateFrequencies.weather.updateSunTimes,
    updateRainForecast: settings.updateFrequencies.weather.updateRainForecast,
    updateTempAndWind: settings.updateFrequencies.weather.updateTempAndWind,
  })

  windows.initiate(settings.updateFrequencies.windows.checkTemperatures)

  scheduledMessages.initiate(
    settings.updateFrequencies.scheduledMessages.checkMessageList
  )

  screens.initiate({
    checkSunTimes: settings.updateFrequencies.screens.checkSunTimes,
    checkWindAndRain: settings.updateFrequencies.screens.checkWindAndRain,
  })

  commands.heatwaveOff()
  commands.heatwaveOn()
  commands.rain()
  commands.sun()
  commands.temps()
  commands.help()
}

startApp()
