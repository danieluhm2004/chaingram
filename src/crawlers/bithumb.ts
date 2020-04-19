import Got, { Got as got } from 'got';
import _ from 'lodash';
import Cheerio from 'cheerio';
import Turndown from 'turndown';
import CrawerController, { ICrawler, IArticle } from '../controllers/crawler';

class BithumbCrawler implements ICrawler {
  public got: got;

  public name: string;

  public contents: boolean;

  public cleanSuffix: boolean;

  public suffix = 'Fellow Bithumb Users,';

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
      prefixUrl: `${endpoint}/view/`,
    });
  }

  public async getLatestArticles(): Promise<IArticle[]> {
    try {
      const res = await this.got.get('/boards/43');
      const $ = Cheerio.load(res.body);

      const items = $('tbody > tr').toArray();
      const articles = await this.toArticle($, items);
      return articles;
    } catch (err) {
      throw Error('❌ | 서버에서 잘못된 응답을 반환하였습니다.');
    }
  }

  public async getArticleContents(idx: string) {
    const res = await this.got.get(`/board-contents/${idx}`);
    const $ = Cheerio.load(res.body);

    const html = $('.board-content').html();
    if (!html) throw Error('⚠️  | 본문이 없는 글입니다.');
    return html;
  }

  public async toArticle(cheerio: CheerioStatic, items: CheerioElement[]): Promise<IArticle[]> {
    const results: IArticle[] = [];
    for (const item of items) {
      try {
        const $ = cheerio(item);

        const onclick = $.attr('onclick') || '';
        const idx = onclick.substring(
          onclick.indexOf('\'') + 1,
          onclick.indexOf(',') - 1,
        );

        if (CrawerController.hasArticle(this.name, idx)) continue;
        const title = $.find('td.one-line').text();
        const url = `https://cafe.bithumb.com/view/board-contents/${idx}`;

        const article: IArticle = {
          idx,
          title,
          url,
        };

        if (this.contents) {
          const turndown = new Turndown();
          const fulltext = await this.getArticleContents(idx);
          let contents = turndown.turndown(fulltext);
          if (this.cleanSuffix) {
            contents = CrawerController.clearSuffix(this.suffix, contents);
          }

          article.contents = contents;
        }

        results.push(article);
      } catch (err) { }
    }

    return results;
  }
}

export default BithumbCrawler;
