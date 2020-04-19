import CrawerController from './controllers/crawler';
import ConfigController from './controllers/config';

ConfigController.initConfig();
CrawerController.initCrawler();
CrawerController.runCrawler();

console.log('✏️  | 세팅이 진행되고 있습니다.');
