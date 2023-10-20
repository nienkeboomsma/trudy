import { Tado as TadoAPI } from 'node-tado-client'
import { constants } from '../config'

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
      console.log(new Date(), 'Tado: Logged in')
    } catch (err) {
      console.log(new Date(), 'Tado: Failed to log in', err)
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
      console.log(new Date(), 'Tado: Created zones list')
    } catch (err) {
      console.log(new Date(), 'Tado: Failed to create zones list', err)
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
        console.log(
          new Date(),
          'Tado: Failed to update indoor temperatures',
          err
        )
      }
    }

    const temperatures = Object.values(this.temperatures)
    const totalTemp = temperatures.reduce((sum, current) => sum + current)
    const averageTemp = totalTemp / temperatures.length
    this.temperatures.average = Number(averageTemp.toFixed(1))

    console.log(new Date(), 'Tado: Updated indoor temperatures')
  }

  async initiate(interval: number) {
    if (interval > 0) {
      await this.login()
      await this.createZonesList()
      await this.updateTemperatures()
      setInterval(() => this.updateTemperatures(), interval)
    }
  }
}

export default new Tado({
  username: constants.TADO_USERNAME,
  password: constants.TADO_PASSWORD,
})
