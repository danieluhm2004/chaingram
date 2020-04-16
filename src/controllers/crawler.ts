import Fs from 'fs';
import Path from 'path';
import ConfigController from './config';
import UpbitCrawler from '../crawlers/upbit';
import TelegramController from './telegram';
import BithumbCrawler from '../crawlers/bithumb';
import CoinoneCrawler from '../crawlers/coinone';

export interface IArticle {
  idx: string;
  title: string;
  contents?: string;
  url: string;
}

export interface ICrawler {
  provider: string,
  getLatestArticles(): Promise<IArticle[]>
}

class CrawerController {
  public static crawlers: { [key: string]: ICrawler } = {};

  public static initCrawler() {
    const {
      upbit, bithumb, coinone, binance,
    } = ConfigController.config!.crawler!;

    if (upbit.enabled) { this.crawlers.upbit = new UpbitCrawler(upbit.endpoint); }
    if (bithumb.enabled) { this.crawlers.bithumb = new BithumbCrawler(bithumb.endpoint); }
    if (coinone.enabled) { this.crawlers.coinone = new CoinoneCrawler(coinone.endpoint); }
  }

  public static runCrawler() {
    console.log('🎒 | 크롤링을 시작합니다.');
    Object.values(this.crawlers).forEach(async (crawler) => {
      console.log(`🐶 | ${crawler.provider.toUpperCase()} 크롤링을 진행하고 있습니다.`);
      const articles = await crawler.getLatestArticles();

      articles.forEach((article) => {
        CrawerController.writeArticle(crawler.provider, article);
        // TelegramController.sendArticle(crawler.provider, article);
      });
    });
  }

  public static hasArticle(provider: string, idx: string): boolean {
    const path = Path.join(
      ConfigController.get('logs', 'logs'),
      provider, `${idx}.md`,
    );

    const exists = Fs.existsSync(path);
    return exists;
  }

  public static writeArticle(provider: string, article: IArticle) {
    const path = Path.join(
      ConfigController.get('logs', 'logs'),
      provider, `${article.idx}.md`,
    );

    Fs.mkdirSync(path.substr(0, path.lastIndexOf('/')), { recursive: true });
    Fs.writeFileSync(path,
      `# ${article.title}\n\n${article.contents || '본문 없음'}\n---
> 출처: [${article.url}](${article.url})`);
  }
}

export default CrawerController;
