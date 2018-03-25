import Module from 'evoozer/Module';
import filesystem from 'evoozer/Module/filesystem';
import build from './build';
import config from './config';
import create from './create';
import list from './list';
import status from './status';
import watch from './watch';
import serve from './serve';


export default new Module(null, [ filesystem ])
  .factory('client/config', config)
  .factory('client/build', build)
  .factory('client/create', create)
  .factory('client/list', list)
  .factory('client/serve', serve)
  .factory('client/status', status)
  .factory('client/watch', watch);
