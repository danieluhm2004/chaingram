import got, { Got } from 'got';
import { getRandom } from 'random-useragent';
import turndown from 'turndown';
import { CrawerController, IArticle, ICrawler, LogController } from '..';

export class BinanceCrawler implements ICrawler {
  public got: Got;
  public name: string;
  public protocol: string = 'binance';
  public contents: boolean;
  public cleanSuffix: boolean;
  public suffix = 'Trade on the go with Binance’s mobile crypto trading app:';

  public constructor(
    name: string,
    endpoint: string,
    contents: boolean = true,
    cleanSuffix: boolean = false
  ) {
    this.name = name;
    this.contents = contents;
    this.cleanSuffix = cleanSuffix;
    this.got = got.extend({
      prefixUrl: `${endpoint}/api/v2/help_center/en-us/categories/115000056351-Announcements`,
      headers: { 'User-Agent': getRandom() },
    });
  }

  public async getLatestArticles(isSetup: boolean): Promise<IArticle[]> {
    const searchParams = {
      page: 1,
      per_page: !isSetup ? 20 : 40,
    };

    const res: any = await this.got
      .get('articles.json', { searchParams })
      .json();

    if (!res) throw Error();
    const { articles } = res;
    if (!articles) throw Error();
    return this.toArticle(articles);
  }

  public async toArticle(items: any[]): Promise<IArticle[]> {
    const results: IArticle[] = [];
    for (const item of items) {
      try {
        const { id: idx, title, html_url: url } = item;
        if (CrawerController.hasArticle(this.name, idx)) continue;
        const article: IArticle = { idx, title, url };

        if (this.contents) {
          let contents = new turndown().turndown(item.body);
          if (this.cleanSuffix) {
            contents = CrawerController.clearSuffix(this.suffix, contents);
          }

          article.contents = contents;
        }

        results.push(article);
      } catch (err: any) {
        LogController.catch(err);
      }
    }

    return results;
  }
}
