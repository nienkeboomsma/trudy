if (
  !process.env.LATITUDE ||
  !process.env.LONGITUDE ||
  !process.env.TADO_HOME_ID ||
  !process.env.TADO_PASSWORD ||
  !process.env.TADO_USERNAME ||
  !process.env.TELEGRAM_CHAT_ID ||
  !process.env.TELEGRAM_TOKEN ||
  !process.env.WEERLIVE_KEY
) {
  throw Error('Please provide a complete .env')
}

export const constants = {
  LATITUDE: Number(process.env.LATITUDE),
  LONGITUDE: Number(process.env.LONGITUDE),
  TADO_HOME_ID: Number(process.env.TADO_HOME_ID),
  TADO_PASSWORD: process.env.TADO_PASSWORD,
  TADO_USERNAME: process.env.TADO_USERNAME,
  TADO_ZONES: [5, 1, 7, 3, 6, 2],
  TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
  TELEGRAM_TOKEN: process.env.TELEGRAM_TOKEN,
  WEERLIVE_KEY: process.env.WEERLIVE_KEY,
}

const minute = 1000 * 60
const hour = 60 * minute

export const settings = {
  screens: {
    morningAzimuth: 125, // 125
    eveningAzimuth: 275, // 275
    maxAcceptableWind: 40, // 40
  },
  updateFrequencies: {
    tado: {
      updateIndoorTemps: 5 * minute, // 5min
    },
    weather: {
      updateSunTimes: 1 * hour, // 1h
      updateTempAndWind: 10 * minute, // 10min
      updateRainForecast: 5 * minute, // 5min
    },
    windows: {
      checkTemperatures: 1 * minute, // 1min
    },
    scheduledMessages: {
      checkMessageList: 1 * minute, // 1min
    },
    screens: {
      checkSunTimes: 1 * minute, // 1m
      checkWindAndRain: 5 * minute, // 5m
    },
  },
}
