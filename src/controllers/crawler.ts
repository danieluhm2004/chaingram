import fs from 'fs';
import path from 'path';
import {
  BinanceCrawler,
  BithumbCrawler,
  CoinoneCrawler,
  ConfigController,
  IConfigCrawler,
  LogController,
  TelegramController,
  UpbitCrawler,
  UpbitDisclosureCrawler,
} from '..';

export interface IArticle {
  idx: string;
  title: string;
  contents?: string;
  url: string;
}

export interface ICrawler {
  name: string;
  suffix: string;
  protocol: string;
  getLatestArticles(isSetup: boolean): Promise<IArticle[]>;
}

export class CrawerController {
  public static crawlers: ICrawler[] = [];

  public static initCrawler() {
    const crawlers: IConfigCrawler[] = ConfigController.get('crawler');

    for (const {
      enabled,
      name,
      endpoint,
      protocol,
      contents,
      cleanSuffix,
    } of crawlers) {
      if (!enabled) continue;
      let crawler: ICrawler | null = null;
      switch (protocol) {
        case 'upbit':
          crawler = new UpbitCrawler(name, endpoint, contents, cleanSuffix);
          break;
        case 'upbit disclosure':
          crawler = new UpbitDisclosureCrawler(
            name,
            endpoint,
            contents,
            cleanSuffix
          );
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
          LogController.log(
            `⚠️  | ${name}는(은) 알 수 없는 프로토콜(${protocol})을 사용하고 있습니다.`
          );
          continue;
      }

      if (!crawler) continue;
      this.crawlers.push(crawler);
    }
  }

  public static async runCrawler(isSetup: boolean): Promise<void> {
    LogController.log('🎒 | 크롤링을 시작합니다.');
    LogController.log(`⏰ | 현재 시간은 ${Date()}`);
    for (const crawler of this.crawlers) {
      try {
        LogController.log(`🐶 | ${crawler.name} 크롤링을 진행하고 있습니다.`);
        const articles = await crawler.getLatestArticles(isSetup);

        articles.reverse();
        for (const article of articles) {
          try {
            CrawerController.writeArticle(crawler, article);
          } catch (err: any) {
            LogController.catch(err);
          }

          try {
            if (isSetup) continue;
            await TelegramController.sendArticle(crawler, article);
          } catch (err: any) {
            LogController.catch(err);
          }
        }
      } catch (err: any) {
        LogController.catch(err);
      }
    }
  }

  public static hasArticle(name: string, idx: string): boolean {
    const logPath = ConfigController.get('logs', 'logs');
    const articlePath = path.join(logPath, name, `${idx}.md`);
    const exists = fs.existsSync(articlePath);
    return exists;
  }

  public static writeArticle(crawler: ICrawler, article: IArticle) {
    const { idx } = article;
    const { name } = crawler;
    const logPath = ConfigController.get('logs', 'logs');
    const articlePath = path.join(logPath, name, `${idx}.md`);
    fs.mkdirSync(articlePath.substr(0, articlePath.lastIndexOf('/')), {
      recursive: true,
    });

    let contents = '';
    contents += `# ${article.title}\n\n`;
    if (article.contents) contents += `${article.contents}\n`;
    contents += '---\n';
    contents += `> 출처: [${article.url}](${article.url})`;
    fs.writeFileSync(articlePath, contents);
  }

  public static clearSuffix(suffix: string, contents: string): string {
    const iof = contents.indexOf(suffix);
    if (iof === -1) return contents;
    return contents.substring(0, iof);
  }
}
