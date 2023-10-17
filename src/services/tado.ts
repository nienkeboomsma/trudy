import { Tado as TadoAPI } from 'node-tado-client'

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

  async login() {
    try {
      await this.api.login(this.username, this.password)
      console.log('Logged in to Tado successfully')
    } catch (err) {
      throw err
    }
  }
}

export default Tado
