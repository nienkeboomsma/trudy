import TelegramAPI from 'node-telegram-bot-api'
import { constants } from '../config'

interface TelegramOptions {
  telegramToken: string
  chatId: string
}

class Telegram {
  private bot: TelegramAPI
  private chatId: string

  constructor(options: TelegramOptions) {
    this.bot = new TelegramAPI(options.telegramToken, { polling: true })
    this.chatId = options.chatId
  }

  sendMessage(message: string, options?: { markdown?: boolean }) {
    const markdown = options?.markdown ?? false

    console.log(new Date(), `Telegram: Sending '${message}'`)
    this.bot.sendMessage(this.chatId, message, {
      parse_mode: markdown ? 'MarkdownV2' : 'HTML',
    })
  }

  listenFor(regexp: RegExp, callback: () => void) {
    console.log(
      new Date(),
      `Telegram: Listening for ${regexp.toString().slice(2, -1)}`
    )
    this.bot.onText(regexp, callback)
  }
}

export default new Telegram({
  telegramToken: constants.TELEGRAM_TOKEN,
  chatId: constants.TELEGRAM_CHAT_ID,
})
