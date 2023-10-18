import { Tado as TadoAPI } from 'node-tado-client'
import constants from '../config'

interface TadoOptions {
  username: string
  password: string
}

interface TemperaturesTypes {
  [zone: string]: number
  average: number
}

class Tado {
  private username: string
  private password: string
  private api: TadoAPI

  constructor(options: TadoOptions) {
    this.username = options.username
    this.password = options.password
    this.api = new TadoAPI()
  }
  zones: Array<{ id: number; name: string }> = []
  temperatures: TemperaturesTypes = { average: 0 }

  async login() {
    try {
      await this.api.login(this.username, this.password)
      console.log('Logged in to Tado successfully')
    } catch (err) {
      throw err
    }
  }

  async createZones() {
    const zoneIds = constants.TADO_ZONES
    const zoneData = await this.api.getZones(constants.TADO_HOME_ID)
    const zones = zoneIds.flatMap((zoneId) => {
      const zone = zoneData.find((zone) => zone.id === zoneId)
      return zone ? { id: zoneId, name: zone.name } : []
    })
    this.zones = zones
  }

  async updateTemperatures() {
    console.log(this.zones)
  }
}

export default Tado
