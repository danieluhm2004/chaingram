import Telegraf, { ContextMessageUpdate } from 'telegraf';
import { ExtraEditMessage } from 'telegraf/typings/telegram-types';
import RemoveMD from 'remove-markdown';
import { IArticle, ICrawler } from './crawler';

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

  public static send(message: string, options?: ExtraEditMessage) {
    if (!this.client) throw Error('❌ | 텔레그램이 설정되지 않았습니다.');
    const { client } = this;
    this.chats.forEach((chatId) => {
      client.telegram.sendMessage(chatId, message, {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        ...options,
      });
    });
  }

  public static sendArticle(crawler: ICrawler, article: IArticle) {
    let message = '';
    message += `💌 #${crawler.name}\n`;
    const protocol = `${crawler.name.charAt(0)}${crawler.name.slice(1)}`;
    message += `<a href="${article.url}">${article.title} (${protocol})</a>\n`;
    if (article.contents) {
      message += RemoveMD(article.contents
        .replace(/\*\*.*\*\*/g, '')
        .replace(/\\/g, '')
        .replace(/\r\n/g, '\n')
        .replace(/ {1,}\n/g, '\n')
        .replace(/\n{2,}/g, '\n'));

      if (message.length > 4096) {
        message = `${message.substr(0, 3500)}...`;
      }
    }


    this.send(message, {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: `${crawler.name}(으)로 이동`,
              url: article.url,
            },
          ],
        ],
      },
    });
  }

  public static stopTelegram() {
    this.client = null;
  }
}

export default TelegramController;
