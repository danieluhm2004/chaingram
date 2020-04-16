// eslint-disable-next-line no-unused-vars
import Telegraf, { ContextMessageUpdate } from 'telegraf';
import ConfigController from './config';

class TelegramController {
  public static chats: number[];

  public static client: Telegraf<ContextMessageUpdate> | null;

  public static initTelegram(token: string, chats: number[]) {
    if (this.client) throw Error('❌ | 이미 텔레그램이 설정된 상태입니다.');
    if (!token) throw Error('❌ | 텔레그램 토큰이 설정되지 않았습니다.');
    if (token === '') throw Error('❌ | 설정 파일에서 텔레그램 토큰을 설정하여야 합니다.');

    this.client = new Telegraf(token);
    this.chats = chats;
  }

  public static send(message: string) {
    if (!this.client) throw Error('❌ | 텔레그램이 설정되지 않았습니다.');
    const { client } = this;
    this.chats.forEach((chatId) => {
      client.telegram.sendMessage(chatId, message);
    });
  }

  public static stopTelegram() {
    this.client = null;
  }
}

export default TelegramController;
