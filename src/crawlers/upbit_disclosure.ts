import Got, { Got as got } from 'got';
import _ from 'lodash';
import CrawerController, { ICrawler, IArticle } from '../controllers/crawler';
import LogController from '../controllers/log';

class UpbitDisclosureCrawler implements ICrawler {
  public got: got;

  public name: string;

  public protocol: string = 'upbit disclosure';

  public contents: boolean;

  public cleanSuffix: boolean;

  public suffix = ''

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
      prefixUrl: `${endpoint}/api/v1`,
    });
  }

  public async getLatestArticles(isSetup: boolean): Promise<IArticle[]> {
    const searchParams = {
      region: 'kr',
      per_page: !isSetup ? 20 : 40,
    };

    const res: any = await this.got.get('disclosure',
      { searchParams }).json();

    if (!res) throw Error();
    const { success, data } = res;
    if (!success) throw Error();
    if (!data) throw Error();
    if (!data.posts) throw Error();


    const articles = await this.toArticle(data.posts);
    return articles;
  }

  public async toArticle(items: any[]): Promise<IArticle[]> {
    const results: IArticle[] = [];
    for (const item of items) {
      try {
        const {
          id: idx, url, text, assets,
        } = item;
        if (CrawerController.hasArticle(this.name, idx)) continue;
        const title = `[${assets}] ${text}`;
        const article: IArticle = {
          idx,
          title,
          url,
        };

        results.push(article);
      } catch (err) {
        LogController.catch(err);
      }
    }

    return results;
  }
}

export default UpbitDisclosureCrawler;
