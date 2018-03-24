import Module from 'evoozer/Module';
import filesystem from 'evoozer/Module/filesystem';
import build from './build';
import config from './config';
import create from './create';
import list from './list';
import status from './status';


export default new Module(null, [ filesystem ])
  .factory('client/config', config)
  .factory('client/build', build)
  .factory('client/create', create)
  .factory('client/list', list)
  .factory('client/status', status);