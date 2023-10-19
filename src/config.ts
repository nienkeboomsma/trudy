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

export const settings = {
  morningAzimuth: 125,
  eveningAzimuth: 275,
  updateFrequencies: {
    indoorTemps: 5 * minute, // 5
    sunTimes: 60 * minute, // 60
    tempAndWind: 10 * minute, // 10
    rain: 5 * minute, // 5
    windows: 1 * minute, // 1
    scheduledMessages: 1 * minute, // 1
  },
}
