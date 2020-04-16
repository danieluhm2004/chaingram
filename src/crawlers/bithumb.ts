import Got, { Got as got } from 'got';
import _ from 'lodash';
import Cheerio from 'cheerio';
import CrawerController, { ICrawler, IArticle } from '../controllers/crawler';

class BithumbCrawler implements ICrawler {
  public got: got;

  public provider: string = 'bithumb';

  public constructor(endpoint: string) {
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

    const contents = $('.board-content').text();
    return contents;
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

        if (CrawerController.hasArticle(this.provider, idx)) continue;
        const title = $.find('td.one-line').text();
        const contents = await this.getArticleContents(idx);
        const url = `https://cafe.bithumb.com/view/board-contents/${idx}`;

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

export default BithumbCrawler;
