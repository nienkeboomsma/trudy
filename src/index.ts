import 'dotenv/config'
import constants from './config'
import Tado from './services/tado'

if (!constants.TADO_USERNAME || !constants.TADO_PASSWORD) {
  throw Error('Tado credentials are missing from .env')
}

const tado = new Tado({
  username: constants.TADO_USERNAME,
  password: constants.TADO_PASSWORD,
})

const test = async () => {
  await tado.login()
  await tado.createZones()
  await tado.updateTemperatures()
}

test()
