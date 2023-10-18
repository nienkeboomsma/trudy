import { Tado as TadoAPI } from 'node-tado-client'
import constants from '../config'

interface TadoOptions {
  username: string
  password: string
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
  temperatures: Record<string, number> = {}

  async login() {
    try {
      await this.api.login(this.username, this.password)
      console.log('Tado: Logged in')
    } catch (err) {
      throw err
    }
  }

  async createZonesList() {
    const zoneIds = constants.TADO_ZONES
    try {
      const zonesData = await this.api.getZones(constants.TADO_HOME_ID)
      const zones = zoneIds.flatMap((zoneId) => {
        const zone = zonesData.find((zone) => zone.id === zoneId)
        return zone ? { id: zoneId, name: zone.name } : []
      })
      this.zones = zones
      console.log('Tado: Created zones list')
    } catch (err) {
      throw err
    }
  }

  async updateTemperatures() {
    for (const zone of this.zones) {
      try {
        const zoneData = await this.api.getZoneState(
          constants.TADO_HOME_ID,
          zone.id
        )
        this.temperatures[zone.name] =
          zoneData.sensorDataPoints.insideTemperature.celsius
      } catch (err) {
        throw err
      }
    }

    const temperatures = Object.values(this.temperatures)
    const totalTemp = temperatures.reduce((sum, current) => sum + current)
    this.temperatures.average = totalTemp / temperatures.length

    console.log('Tado: Updated temperatures')
  }
}

export default new Tado({
  username: constants.TADO_USERNAME,
  password: constants.TADO_PASSWORD,
})
