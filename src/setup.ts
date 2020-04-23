import CrawerController from './controllers/crawler';
import ConfigController from './controllers/config';
import LogController from './controllers/log';

ConfigController.initConfig();
CrawerController.initCrawler();
CrawerController.runCrawler(true);

LogController.log('✏️  | 세팅이 진행되고 있습니다.');
