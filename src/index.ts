import {
  ConfigController,
  CrawerController,
  IConfigCrawler,
  LogController,
  TelegramController,
} from '.';

export * from './controllers';
export * from './crawlers';

async function main() {
  try {
    ConfigController.initConfig();
    const token: string = ConfigController.get('telegram.token');
    const chats: number[] = ConfigController.get('telegram.chats');
    const interval: number = ConfigController.get('interval');
    const crawlers: IConfigCrawler[] = ConfigController.get('crawler');

    LogController.log('👍 | 설정 파일이 로드되었어요.');

    LogController.log(`👍 | 업데이트 간격: ${interval}초`);
    if (chats.length > 0) {
      LogController.log('👍 | 채널:');
      chats.forEach((chat) => {
        LogController.log(`👍 |    - ${chat}`);
      });
    }

    if (crawlers.length > 0) {
      LogController.log('👍 | 크롤링: ');
      crawlers.forEach((crawler) => {
        const status = crawler.enabled ? '⭕️' : '❌';
        LogController.log(
          `👍 |    - ${status} ${crawler.name}: ${crawler.endpoint}`
        );
      });
    }

    TelegramController.initTelegram(token, chats);
    CrawerController.initCrawler();
    LogController.log('👋 | 모든 준비가 완료되었어요.');
    CrawerController.runCrawler(false);
    setInterval(() => CrawerController.runCrawler(false), interval * 1000);
  } catch (err: any) {
    LogController.catch(err);
  }
}

if (require.main === module) main();
