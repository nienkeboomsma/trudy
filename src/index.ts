import 'dotenv/config'
import tado from './services/tado'
import telegram from './services/telegram'

const initiateTado = async () => {
  await tado.login()
  await tado.createZonesList()
  await tado.updateTemperatures()
  setInterval(async () => await tado.updateTemperatures(), 1000 * 60 * 5)
}

const testTelegram = () => {
  telegram.sendMessage('*bold text*', { markdown: true })
  telegram.listenFor(/^\/.*/, () => {
    console.log('Telegram: Detected incoming command')
    telegram.sendMessage('Hello there!')
  })
}

initiateTado()
testTelegram()
