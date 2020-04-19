import Fs from 'fs';
import _ from 'lodash';

export interface IConfigTelegram {
  token: string;
  chats: number[];
}

export interface IConfigCrawler {
  name: string;
  enabled: boolean;
  protocol: string;
  endpoint: string;
  contents: boolean;
  cleanSuffix: boolean;
}

export interface IConfig {
  interval: number;
  telegram: IConfigTelegram;
  crawler: IConfigCrawler[];
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
    crawler: [
      {
        name: '업비트',
        enabled: true,
        protocol: 'upbit',
        endpoint: 'https://api-manager.upbit.com',
        contents: true,
        cleanSuffix: false,
      },
      {
        name: '빗썸',
        enabled: true,
        protocol: 'bithumb',
        endpoint: 'https://cafe.bithumb.com',
        contents: true,
        cleanSuffix: false,
      },
      {
        name: '코인원',
        enabled: true,
        protocol: 'coinone',
        endpoint: 'https://i1.coinone.co.kr',
        contents: false,
        cleanSuffix: false,
      },
      {
        name: '바이낸스',
        enabled: true,
        protocol: 'binance',
        endpoint: 'https://binance.zendesk.com',
        contents: false,
        cleanSuffix: true,
      },
    ],
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
