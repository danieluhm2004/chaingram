import Got, { Got as got } from 'got';
import _ from 'lodash';
import Turndown from 'turndown';
import CrawerController, { ICrawler, IArticle } from '../controllers/crawler';
import LogController from '../controllers/log';

class BinanceCrawler implements ICrawler {
  public got: got;

  public name: string;

  public protocol: string = 'binance';

  public contents: boolean;

  public cleanSuffix: boolean;

  public suffix = 'Trade on the go with Binance’s mobile crypto trading app:';

  public constructor(
    name: string,
    endpoint: string,
    contents: boolean = true,
    cleanSuffix: boolean = false,
  ) {
    this.name = name;
    this.contents = contents;
    this.cleanSuffix = cleanSuffix;
    this.got = Got.extend({
      prefixUrl: `${endpoint}/api/v2/help_center/en-us/categories/115000056351-Announcements`,
    });
  }

  public async getLatestArticles(isSetup: boolean): Promise<IArticle[]> {
    const searchParams = {
      page: 1,
      per_page: !isSetup ? 20 : 40,
    };

    const res: any = await this.got.get('/articles.json',
      { searchParams }).json();

    if (!res) throw Error();
    const { articles } = res;
    if (!articles) throw Error();

    const results = await this.toArticle(articles);

    return results;
  }

  public async toArticle(items: any[]): Promise<IArticle[]> {
    const results: IArticle[] = [];
    for (const item of items) {
      try {
        const { id: idx, title, html_url: url } = item;
        if (CrawerController.hasArticle(this.name, idx)) continue;
        const article: IArticle = {
          idx,
          title,
          url,
        };

        if (this.contents) {
          const turndown = new Turndown();
          let contents = turndown.turndown(item.body);

          if (this.cleanSuffix) {
            contents = CrawerController.clearSuffix(this.suffix, contents);
          }

          article.contents = contents;
        }

        results.push(article);
      } catch (err) {
        LogController.catch(err);
      }
    }

    return results;
  }
}

export default BinanceCrawler;
