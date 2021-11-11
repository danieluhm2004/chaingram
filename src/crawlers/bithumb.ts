import cheerio from 'cheerio';
import got, { Got } from 'got';
import { getRandom } from 'random-useragent';
import turndown from 'turndown';
import { CrawerController, IArticle, ICrawler, LogController } from '..';

export class BithumbCrawler implements ICrawler {
  public got: Got;
  public name: string;
  public endpoint: string;
  public protocol: string = 'bithumb';
  public contents: boolean;
  public cleanSuffix: boolean;
  public suffix = 'Fellow Bithumb Users,';

  public constructor(
    name: string,
    endpoint: string,
    contents: boolean = true,
    cleanSuffix: boolean = false
  ) {
    this.name = name;
    this.endpoint = endpoint;
    this.contents = contents;
    this.cleanSuffix = cleanSuffix;
    this.got = got.extend({
      prefixUrl: `${endpoint}/view`,
      headers: { 'User-Agent': getRandom() },
    });
  }

  public async getLatestArticles(isSetup: boolean): Promise<IArticle[]> {
    const articles = [];
    for (let i = 0; i <= (!isSetup ? 0 : 1); i += 1) {
      const searchParams = { pageNumber: i };
      const res = await this.got.get('boards/43', { searchParams });
      const $ = cheerio.load(res.body);
      const items = $('tbody > tr').toArray();
      const article = await this.toArticle($, items);
      articles.push(...article);
    }

    return articles;
  }

  public async getArticleContents(idx: string) {
    const res = await this.got.get(`board-contents/${idx}`);
    const $: cheerio.Root = cheerio.load(res.body);
    const html = $('.board-content').html();
    if (!html) throw Error('⚠️  | 본문이 없는 글입니다.');
    return html;
  }

  public async toArticle(
    cheerio: cheerio.Root,
    items: cheerio.Element[]
  ): Promise<IArticle[]> {
    const results: IArticle[] = [];
    for (const item of items) {
      try {
        const $ = cheerio(item);
        const onclick = $.attr('onclick') || '';
        const match = onclick.match(/^toDetailOrUrl\(event, \'(.*)\',\'\'\)$/);
        const idx = match && match.length <= 2 ? match[1] : null;
        if (!idx) {
          LogController.log('⚠️  | 올바른 공지사항이 아닙니다.');
          continue;
        }

        if (CrawerController.hasArticle(this.name, idx)) continue;
        const title = $.find('td.one-line').text();
        const url = `${this.endpoint}/view/board-contents/${idx}`;
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
