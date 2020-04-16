import Fs from 'fs';
import _ from 'lodash';

export interface IConfigTelegram {
  token: string;
  chats: number[];
}

export interface IConfigCrawlerProps {
  enabled: boolean;
  endpoint: string;
}

export interface IConfigCrawler {
  upbit: IConfigCrawlerProps;
  bithumb: IConfigCrawlerProps;
  coinone: IConfigCrawlerProps;
  binance: IConfigCrawlerProps;
}

export interface IConfig {
  interval: number;
  telegram: IConfigTelegram;
  crawler: IConfigCrawler;
}

class ConfigController {
  public static readonly path = './config.json';

  public static config: IConfig | null = null;

  public static readonly defaultConfig: IConfig = {
    interval: 60,
    telegram: {
      token: '',
      chats: [],
    },
    crawler: {
      upbit: {
        enabled: true,
        endpoint: 'https://api-manager.upbit.com',
      },
      bithumb: {
        enabled: true,
        endpoint: 'https://cafe.bithumb.com',
      },
      coinone: {
        enabled: true,
        endpoint: 'https://i1.coinone.co.kr',
      },
      binance: {
        enabled: true,
        endpoint: 'https://binance.zendesk.com',
      },
    },
  }

  public static initConfig() {
    let obj: IConfig = this.defaultConfig;
    if (Fs.existsSync(this.path)) {
      const configFile = Fs.readFileSync(this.path);
      obj = JSON.parse(configFile.toString());
    }

    this.config = Object.assign(this.defaultConfig, obj);
    this.saveConfig();
  }

  public static saveConfig() {
    const str = JSON.stringify(this.config, undefined, 4);
    Fs.writeFileSync(this.path, str);
  }

  public static get(path: string, defaultValue?: string) {
    if (!this.config) throw Error('❌ | 설정 파일이 로드되지 않았습니다.');
    return _.get(this.config, path, defaultValue);
  }

  public static set(path: string, value: any) {
    if (!this.config) throw Error('❌ | 설정 파일이 로드되지 않았습니다.');
    this.config = _.set(this.config, path, value);
    this.saveConfig();
  }
}

export default ConfigController;
