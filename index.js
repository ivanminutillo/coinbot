'use strict'

const Telegram = require('telegram-node-bot')
const TelegramBaseController = Telegram.TelegramBaseController
const TextCommand = Telegram.TextCommand
const tg = new Telegram.Telegram('279000152:AAFb5pq0V9e2eZM0TmWq1tcxjMtCL1iMCuQ')

console.log('ciaone')
class PingController extends TelegramBaseController {
  /**
  * @param Scope $
  */
  pingHandler($) {
    $.sendMessage('pong')
  }

  get routes() {
    return {
      'pingCommand' : 'pingHandler'
    }
  }
}

tg.router
  .when(
    new TextCommand('ping', 'pingCommand'),
    new PingController()
  )
