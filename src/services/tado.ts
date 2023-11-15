import { Tado as TadoAPI } from 'node-tado-client'
import { constants } from '../config'

interface TadoOptions {
  username: string
  password: string
}

type Zone = Readonly<{
  id: number
  name: string
  temperature: number | null
}>

class Tado {
  private username: string
  private password: string
  private api: TadoAPI

  constructor(options: TadoOptions) {
    this.username = options.username
    this.password = options.password
    this.api = new TadoAPI()
  }
  private zones: ReadonlyArray<Zone> = []
  private averageTemp?: number

  public getZones() {
    return this.zones
  }

  public getAverageTemp() {
    return this.averageTemp
  }

  private async login() {
    try {
      await this.api.login(this.username, this.password)
      console.log(new Date(), 'Tado: Logged in')
    } catch (err) {
      console.log(new Date(), 'Tado: Failed to log in', err)
    }
  }

  private async createZonesList() {
    const zoneIds = constants.TADO_ZONES
    try {
      const zonesData = await this.api.getZones(constants.TADO_HOME_ID)
      const zones = zoneIds.flatMap((zoneId) => {
        const zone = zonesData.find((zone) => zone.id === zoneId)
        return zone ? { id: zoneId, name: zone.name, temperature: null } : []
      })
      this.zones = zones
      console.log(new Date(), 'Tado: Created zones list')
    } catch (err) {
      console.log(new Date(), 'Tado: Failed to create zones list', err)
    }
  }

  private async updateZones() {
    try {
      let newZones: Array<Zone> = []
      for (const zone of this.zones) {
        const zoneData = await this.api.getZoneState(
          constants.TADO_HOME_ID,
          zone.id
        )
        newZones = [
          ...newZones,
          {
            ...zone,
            temperature: zoneData.sensorDataPoints.insideTemperature.celsius,
          },
        ]
      }
      this.zones = newZones

      console.log(new Date(), 'Tado: Updated indoor temperatures')
    } catch (err) {
      console.log(new Date(), 'Tado: Failed to update indoor temperatures', err)
    }
  }

  private updateAverageTemp() {
    const allTemperatures = this.zones
      .map((zone) => zone.temperature)
      .filter(
        (temperature): temperature is number => typeof temperature === 'number'
      )

    if (allTemperatures.length === 0) {
      console.log(
        new Date(),
        'Tado: Failed to update average temperature, because all indoor temperatures are null'
      )
      return
    }

    const totalTemp = allTemperatures.reduce((sum, current) => sum + current)
    const average = totalTemp / allTemperatures.length
    this.averageTemp = Number(average.toFixed(1))
    console.log(new Date(), 'Tado: Updated average temperature')
  }

  private async updateTemperatures() {
    await this.updateZones()
    this.updateAverageTemp()
  }

  public async initiate(interval: number) {
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
