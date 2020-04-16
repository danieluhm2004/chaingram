import { CronJob } from 'cron';
import ConfigController, { IConfigCrawler } from './controllers/config';
import TelegramController from './controllers/telegram';
import UpbitCrawler from './crawlers/upbit';
import CrawerController from './controllers/crawler';

try {
  ConfigController.initConfig();

  const token: string = ConfigController.get('telegram.token');
  const chats: number[] = ConfigController.get('telegram.chats');
  const interval: number[] = ConfigController.get('interval');
  const crawlers: IConfigCrawler[] = ConfigController.get('crawler');

  console.log('👍 | 설정 파일이 로드되었어요.');

  console.log(`👍 | 업데이트 간격: ${interval}초`);
  if (chats.length > 0) {
    console.log('👍 | 채널:');
    chats.forEach((chat) => {
      console.log(`👍 |    - ${chat}`);
    });
  }

  if (crawlers.length > 0) {
    console.log('👍 | 크롤링: ');

    crawlers.forEach((crawler) => {
      const status = crawler.enabled ? '⭕️' : '❌';
      console.log(`👍 |    - ${status} ${crawler.name}: ${crawler.endpoint}`);
    });
  }

  TelegramController.initTelegram(token, chats);
  CrawerController.initCrawler();

  console.log('👋 | 모든 준비가 완료되었어요.');

  CrawerController.runCrawler();
} catch (err) {
  console.log(err.message);
}
