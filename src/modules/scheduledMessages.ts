import { telegram } from '../services'

interface ScheduledMessage {
  dateAndTime: Date
  content: string
}

class ScheduledMessages {
  messageList: Array<ScheduledMessage> = []

  scheduleMessage(message: ScheduledMessage) {
    const messageAlreadyExists = this.messageList.some(
      (e) =>
        e.content === message.content && e.dateAndTime === message.dateAndTime
    )
    if (messageAlreadyExists) return
    this.messageList = [...this.messageList, message]
    console.log(
      new Date(),
      `Scheduled messages: '${
        message.content
      }' scheduled to be sent after ${message.dateAndTime.toLocaleString()}`
    )
  }

  checkmessageList() {
    const now = new Date()
    this.messageList.forEach((message) => {
      if (message.dateAndTime < now) {
        console.log(
          new Date(),
          `Scheduled messages: Time to send '${message.content}'`
        )
        telegram.sendMessage(message.content)
        this.messageList = this.messageList.filter(
          (e) =>
            e.content !== message.content &&
            e.dateAndTime !== message.dateAndTime
        )
      }
    })
  }

  initiate(interval: number) {
    if (interval > 0) {
      this.checkmessageList()
      setInterval(() => this.checkmessageList(), interval)
    }
  }
}

export default new ScheduledMessages()
