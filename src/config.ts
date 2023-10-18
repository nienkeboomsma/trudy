if (
  !process.env.TADO_HOME_ID ||
  !process.env.TADO_PASSWORD ||
  !process.env.TADO_USERNAME ||
  !process.env.TELEGRAM_CHAT_ID ||
  !process.env.TELEGRAM_TOKEN
) {
  throw Error('Please provide a complete .env')
}

const constants = {
  TADO_HOME_ID: Number(process.env.TADO_HOME_ID),
  TADO_PASSWORD: process.env.TADO_PASSWORD,
  TADO_USERNAME: process.env.TADO_USERNAME,
  TADO_ZONES: [5, 1, 7, 3, 6, 2],
  TELEGRAM_CHAT_ID: process.env.TELEGRAM_CHAT_ID,
  TELEGRAM_TOKEN: process.env.TELEGRAM_TOKEN,
}

export default constants
