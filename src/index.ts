import 'dotenv/config'
import { tado, weather } from './services'
import { windows } from './modules'
import { settings } from './config'

const startApp = async () => {
  await tado.initiate(settings.updateFrequencies.indoorTemps)
  await weather.initiate({
    sunTimes: settings.updateFrequencies.sunTimes,
    rain: settings.updateFrequencies.rain,
    tempAndWind: settings.updateFrequencies.tempAndWind,
  })
  windows.initiate(settings.updateFrequencies.windows)
}

startApp()
