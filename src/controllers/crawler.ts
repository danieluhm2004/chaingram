import Fs from 'fs';
import Path from 'path';
import ConfigController, { IConfigCrawler } from './config';
import UpbitCrawler from '../crawlers/upbit';
import TelegramController from './telegram';
import BithumbCrawler from '../crawlers/bithumb';
import CoinoneCrawler from '../crawlers/coinone';
import BinanceCrawler from '../crawlers/binance';

export interface IArticle {
  idx: string;
  title: string;
  contents?: string;
  url: string;
}

export interface ICrawler {
  name: string;
  suffix: string;
  getLatestArticles(): Promise<IArticle[]>;
}

class CrawerController {
  public static crawlers: ICrawler[] = [];

  public static initCrawler() {
    const crawlers: IConfigCrawler[] = ConfigController.get('crawler');

    for (const {
      enabled, name, endpoint, protocol, contents, cleanSuffix,
    } of crawlers) {
      if (!enabled) continue;
      let crawler: ICrawler | null = null;

      switch (protocol) {
        case 'upbit':
          crawler = new UpbitCrawler(name, endpoint, contents, cleanSuffix);
          break;
        case 'bithumb':
          crawler = new BithumbCrawler(name, endpoint, contents, cleanSuffix);
          break;
        case 'coinone':
          crawler = new CoinoneCrawler(name, endpoint, contents, cleanSuffix);
          break;
        case 'binance':
          crawler = new BinanceCrawler(name, endpoint, contents, cleanSuffix);
          break;
        default:
          console.log(`⚠️  | ${name}는(은) 알 수 없는 프로토콜(${protocol})을 사용하고 있습니다.`);
          continue;
      }

      if (!crawler) continue;
      this.crawlers.push(crawler);
    }
  }

  public static runCrawler() {
    console.log('🎒 | 크롤링을 시작합니다.');
    this.crawlers.forEach(async (crawler) => {
      console.log(`🐶 | ${crawler.name} 크롤링을 진행하고 있습니다.`);
      const articles = await crawler.getLatestArticles();

      articles.reverse();
      articles.forEach((article) => {
        try { TelegramController.sendArticle(crawler, article); } catch (err) { }
        try { CrawerController.writeArticle(crawler, article); } catch (err) { }
      });
    });
  }

  public static hasArticle(name: string, idx: string): boolean {
    const path = Path.join(
      ConfigController.get('logs', 'logs'),
      name, `${idx}.md`,
    );

    const exists = Fs.existsSync(path);
    return exists;
  }

  public static writeArticle(crawler: ICrawler, article: IArticle) {
    const path = Path.join(
      ConfigController.get('logs', 'logs'),
      crawler.name, `${article.idx}.md`,
    );

    Fs.mkdirSync(
      path.substr(0, path.lastIndexOf('/')),
      { recursive: true },
    );

    let contents = '';
    contents += `# ${article.title}\n\n`;
    if (article.contents) { contents += `${article.contents}\n`; }
    contents += '---\n';
    contents += `> 출처: [${article.url}](${article.url})`;

    Fs.writeFileSync(path, contents);
  }

  public static clearSuffix(suffix: string, contents: string): string {
    const iof = contents.indexOf(suffix);
    if (iof === -1) return contents;
    return contents.substring(0, iof);
  }
}

export default CrawerController;
