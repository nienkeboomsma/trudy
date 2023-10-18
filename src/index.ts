import 'dotenv/config'
import tado from './services/tado'
import telegram from './services/telegram'
import weather from './services/weather'
import { settings } from './config'

const initiateTado = async () => {
  await tado.login()
  await tado.createZonesList()
  await tado.updateTemperatures()
  setInterval(
    async () => await tado.updateTemperatures(),
    settings.updateFrequencies.indoorTemps
  )
}

const initiateWeather = async () => {
  weather.updateSunTimes()
  setInterval(
    () => weather.updateSunTimes(),
    settings.updateFrequencies.sunTimes
  )
  await weather.updateRainForecast()
  setInterval(
    async () => await weather.updateRainForecast(),
    settings.updateFrequencies.rain
  )
  await weather.updateTempAndWind()
  setInterval(
    async () => await weather.updateTempAndWind(),
    settings.updateFrequencies.tempAndWind
  )
}

const startApp = async () => {
  await initiateTado()
  await initiateWeather()
}

startApp()
