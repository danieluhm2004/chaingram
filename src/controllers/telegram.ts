import RemoveMD from 'remove-markdown';
import telegraf, { Telegraf } from 'telegraf';
import { IArticle, ICrawler } from '..';

export class TelegramController {
  public static chats: number[];
  public static client: Telegraf | null;

  public static initTelegram(token: string, chats: number[]) {
    if (this.client) throw Error('❌ | 이미 텔레그램이 설정된 상태입니다.');
    if (!token) throw Error('❌ | 텔레그램 토큰이 설정되지 않았습니다.');
    this.client = new Telegraf(token);
    this.chats = chats;
  }

  public static async send(
    message: string,
    options?: telegraf.Types.ExtraReplyMessage
  ): Promise<void> {
    if (!this.client) throw Error('❌ | 텔레그램이 설정되지 않았습니다.');
    const { client } = this;
    await Promise.all(
      this.chats.map((chatId) =>
        client.telegram.sendMessage(chatId, message, {
          parse_mode: 'HTML',
          disable_web_page_preview: true,
          ...options,
        })
      )
    );
  }

  public static async sendArticle(
    crawler: ICrawler,
    article: IArticle
  ): Promise<void> {
    let message = '';
    const { name, protocol } = crawler;
    const { title, url, contents } = article;
    const displayName = `${name} (${protocol.charAt(0)}${protocol.slice(1)})`;
    message += `💌 #${displayName} 공지\n`;
    message += `<a href="${url}">${title}</a>\n`;
    if (contents) {
      message += RemoveMD(
        contents
          .replace(/\*{2}/g, '')
          .replace(/\\/g, '')
          .replace(/\r\n/g, '\n')
          .replace(/ {1,}\n/g, '\n')
          .replace(/\n{2,}/g, '\n')
          .replace(/!\[.*\]\(.*/g, '')
          .replace(/".*"\)/g, '')
      );

      if (message.length > 4096) message = `${message.substr(0, 3500)}...`;
    }

    const text = `${name}(으)로 이동`;
    await this.send(message, {
      reply_markup: { inline_keyboard: [[{ text, url }]] },
    });
  }

  public static stopTelegram() {
    this.client = null;
  }
}
