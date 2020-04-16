import Got, { Got as got } from 'got';
import _ from 'lodash';
import Turndown from 'turndown';
import CrawerController, { ICrawler, IArticle } from '../controllers/crawler';

class CoinoneCrawler implements ICrawler {
  public got: got;

  public provider: string = 'coinone';

  public constructor(endpoint: string) {
    this.got = Got.extend({
      prefixUrl: `${endpoint}/api/talk/notice`,
      rejectUnauthorized: true,
      headers: {
        referer: 'https://coinone.co.kr/talk/notice',
      },
    });
  }

  public async getLatestArticles(): Promise<IArticle[]> {
    try {
      const searchParams = {
        page: 1,
        searchWord: '',
        searchType: '',
        ordering: '-created_at',
      };

      const res: any = await this.got.get('/',
        { searchParams }).json();

      if (!res) throw Error();
      const { results } = res;
      if (!results) throw Error();

      const articles = await this.toArticle(results);
      return articles;
    } catch (err) {
      throw Error('❌ | 서버에서 잘못된 응답을 반환하였습니다.');
    }
  }

  public async getArticleContents(idx: string) {
    const res: any = await this.got.get(`/${idx}`).json();

    if (!res) throw Error();
    const turndown = new Turndown();
    const contents = turndown.turndown(res.content);
    return contents;
  }

  public async toArticle(items: any[]): Promise<IArticle[]> {
    const results: IArticle[] = [];
    for (const item of items) {
      try {
        const idx = item.id;
        if (CrawerController.hasArticle(this.provider, idx)) continue;
        const contents = await this.getArticleContents(idx);
        const title = `[${item.card_category}] ${item.title}`;
        const url = `https://coinone.co.kr/talk/notice/detail/${idx}`;
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

export default CoinoneCrawler;
