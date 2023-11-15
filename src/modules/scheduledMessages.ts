import { telegram } from '../services'

type ScheduledMessage = Readonly<{
  dateAndTime: Date
  content: string
}>

class ScheduledMessages {
  private messageList: ReadonlyArray<ScheduledMessage> = []

  public scheduleMessage(message: ScheduledMessage) {
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

  public cancelMessage(message: ScheduledMessage) {
    this.messageList = this.messageList.filter(
      (e) =>
        e.content !== message.content && e.dateAndTime !== message.dateAndTime
    )
    console.log(
      new Date(),
      `Scheduled messages: Removed '${message.content}' from list`
    )
  }

  private checkmessageList() {
    const now = new Date()
    this.messageList.forEach((message) => {
      if (message.dateAndTime < now) {
        console.log(
          new Date(),
          `Scheduled messages: Time to send '${message.content}'`
        )
        telegram.sendMessage(message.content)
        this.cancelMessage(message)
      }
    })
  }

  public initiate(interval: number) {
    if (interval > 0) {
      this.checkmessageList()
      setInterval(() => this.checkmessageList(), interval)
    }
  }
}

export default new ScheduledMessages()
