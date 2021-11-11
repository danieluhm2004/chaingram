import Got, { Got as got } from 'got';
import turndown from 'turndown';
import { CrawerController, IArticle, ICrawler, LogController } from '..';

export class CoinoneCrawler implements ICrawler {
  public got: got;
  public name: string;
  public protocol: string = 'coinone';
  public contents: boolean;
  public cleanSuffix: boolean;
  public suffix = '';

  public constructor(
    name: string,
    endpoint: string,
    contents: boolean = true,
    cleanSuffix: boolean = false
  ) {
    this.name = name;
    this.contents = contents;
    this.cleanSuffix = cleanSuffix;
    this.got = Got.extend({
      prefixUrl: `${endpoint}/api/talk`,
      headers: { referer: 'https://coinone.co.kr/talk/notice' },
    });
  }

  public async getLatestArticles(isSetup: boolean): Promise<IArticle[]> {
    const results = [];
    for (let i = 1; i <= (!isSetup ? 1 : 2); i += 1) {
      const searchParams = {
        page: i,
        searchWord: '',
        searchType: '',
        ordering: '-created_at',
      };

      const opts = { searchParams };
      const res: any = await this.got.get('notice', opts).json();
      if (!res || !res.results) throw Error();
      results.push(...res.results);
    }

    return this.toArticle(results);
  }

  public async getArticleContents(idx: string) {
    const res: any = await this.got.get(idx).json();
    if (!res || !res.content) throw Error();
    return res.content;
  }

  public async toArticle(items: any[]): Promise<IArticle[]> {
    const results: IArticle[] = [];
    for (const item of items) {
      try {
        const idx = item.id;
        if (CrawerController.hasArticle(this.name, idx)) continue;
        const title = `${item.card_category} / ${item.title}`;
        const url = `https://coinone.co.kr/talk/notice/detail/${idx}`;
        const article: IArticle = { idx, title, url };

        if (this.contents) {
          const fulltext = await this.getArticleContents(idx);
          let contents = new turndown().turndown(fulltext);
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
