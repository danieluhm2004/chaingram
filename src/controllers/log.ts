import Fs from 'fs';
import Path from 'path';
import ConfigController from './config';

class LogController {
  static log(...message: string[]) {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();

    const path = Path.join(
      ConfigController.get('logs', 'logs'),
      'info', String(year), String(month), String(day),
      `${year}-${month}-${day} ${hour}.txt`,
    );

    Fs.mkdirSync(
      path.substr(0, path.lastIndexOf('/')),
      { recursive: true },
    );

    Fs.appendFile(path, `${message.join(' ')}\n`, () => { });
    console.log(...message);
  }

  static catch(err: Error) {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    const path = Path.join(
      ConfigController.get('logs', 'logs'),
      'error', String(year), String(month), String(day),
      `${year}-${month}-${day} ${hour}:${minutes}:${seconds}.txt`,
    );

    Fs.mkdirSync(
      path.substr(0, path.lastIndexOf('/')),
      { recursive: true },
    );

    Fs.appendFile(path, `${err.name}\n${err.message}\n${err.stack}\n\n`, () => { });
  }
}

export default LogController;
