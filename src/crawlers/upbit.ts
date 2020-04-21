import Got, { Got as got } from 'got';
import _ from 'lodash';
import CrawerController, { ICrawler, IArticle } from '../controllers/crawler';

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
      prefixUrl: `${endpoint}/api/v1/notices`,
    });
  }

  public async getLatestArticles(): Promise<IArticle[]> {
    try {
      const searchParams = {
        page: 1,
        per_page: 20,
        thread_name: 'general',
      };

      const res: any = await this.got.get('/',
        { searchParams }).json();

      if (!res) throw Error();
      const { success, data } = res;
      if (!success) throw Error();
      if (!data) throw Error();
      if (!data.list) throw Error();
      if (!data.fixed_notices) throw Error();

      const lists = _.merge(data.list, data.fixed_notices);
      const articles = await this.toArticle(lists);

      return articles;
    } catch (err) {
      throw Error('❌ | 서버에서 잘못된 응답을 반환하였습니다.');
    }
  }

  public async getArticleContents(idx: string) {
    const res: any = await this.got.get(`/${idx}`).json();

    if (!res) throw Error();
    const { success, data } = res;
    if (!success) throw Error();
    if (!data) throw Error();
    if (!data.body) throw Error();

    return data.body;
  }

  public async toArticle(items: any[]): Promise<IArticle[]> {
    const results: IArticle[] = [];
    for (const item of items) {
      try {
        const { id: idx, title } = item;
        if (CrawerController.hasArticle(this.name, idx)) break;
        const url = `https://upbit.com/service_center/notice?id=${idx}`;
        const article: IArticle = {
          idx,
          title,
          url,
        };

        console.log(title);
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
      } catch (err) { console.log(err.message); }
    }

    return results;
  }
}

export default UpbitCrawler;
