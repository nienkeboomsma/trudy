import 'dotenv/config'
import tado from './services/tado'
import telegram from './services/telegram'
import weather from './services/weather'
import { settings } from './config'

const startApp = async () => {
  await tado.initiate(settings.updateFrequencies.indoorTemps)
  await weather.initiate({
    sunTimes: settings.updateFrequencies.sunTimes,
    rain: settings.updateFrequencies.rain,
    tempAndWind: settings.updateFrequencies.tempAndWind,
  })
}

startApp()
