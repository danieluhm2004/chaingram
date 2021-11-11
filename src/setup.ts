import { ConfigController, CrawerController, LogController } from '.';

async function setup() {
  ConfigController.initConfig();
  LogController.log('✏️  | 세팅이 진행되고 있습니다.');

  CrawerController.initCrawler();
  await CrawerController.runCrawler(true);

  LogController.log('✏️  | 세팅이 완료되었습니다.');
}

setup();