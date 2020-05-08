import Got, { Got as got } from 'got';
import _ from 'lodash';
import CrawerController, { ICrawler, IArticle } from '../controllers/crawler';
import LogController from '../controllers/log';

class UpbitCrawler implements ICrawler {
  public got: got;

  public name: string;

  public protocol: string = 'upbit';

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
      page: 1,
      per_page: !isSetup ? 20 : 40,
      thread_name: 'general',
    };

    const res: any = await this.got.get('/notices', { searchParams }).json();

    if (!res) throw Error();
    const { success, data } = res;
    if (!success || !data || !data.list || !data.fixed_notices) throw Error();

    const [list, notices] = await Promise.all([
      this.toArticle(data.list),
      this.toArticle(data.fixed_notices),
    ]);

    const articles = _.merge(notices, list);
    return articles;
  }

  public async getArticleContents(idx: string) {
    const res: any = await this.got.get(`/notices/${idx}`).json();

    if (!res) throw Error();
    const { success, data } = res;
    if (!success) throw Error();
    if (!data || !data.body) throw Error();

    return data.body;
  }

  public async toArticle(items: any[]): Promise<IArticle[]> {
    const results: IArticle[] = [];
    for (const item of items) {
      try {
        const { id: idx, title } = item;
        if (CrawerController.hasArticle(this.name, idx)) continue;
        const url = `https://upbit.com/service_center/notice?id=${idx}`;
        const article: IArticle = {
          idx,
          title,
          url,
        };

        if (this.contents) {
          let contents: string = await this.getArticleContents(idx);

          if (this.cleanSuffix) {
            const regex = /---\r\n\r\n\*{2}\[[A-Za-z0-9]{0,}\]/g;
            const match = contents.match(regex);
            if (match && match.length >= 1) {
              contents = CrawerController.clearSuffix(match[0], contents);
            }
          }

          article.contents = contents;
        }

        results.push(article);
      } catch (err) {
        console.log(err);
        LogController.catch(err);
      }
    }

    return results;
  }
}

export default UpbitCrawler;
