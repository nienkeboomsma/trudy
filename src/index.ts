import 'dotenv/config'
import tado from './services/tado'

const initiateTado = async () => {
  await tado.login()
  await tado.createZonesList()
  await tado.updateTemperatures()
  setInterval(async () => await tado.updateTemperatures(), 1000 * 60 * 5)
}

initiateTado()
