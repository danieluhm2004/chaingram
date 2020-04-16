import Got, { Got as got } from 'got';
import _ from 'lodash';
import CrawerController, { ICrawler, IArticle } from '../controllers/crawler';

class UpbitCrawler implements ICrawler {
  public got: got;

  public provider: string = 'upbit';

  public constructor(endpoint: string) {
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
        if (CrawerController.hasArticle(this.provider, idx)) continue;
        const contents = await this.getArticleContents(idx);
        const url = `https://upbit.com/service_center/notice?id=${idx}`;

        const article = {
          idx,
          title,
          contents,
          url,
        };

        results.push(article);
      } catch (err) { }
    }

    return results;
  }
}

export default UpbitCrawler;
