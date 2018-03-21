import Module from 'evoozer/Module';
import filesystem from 'evoozer/Module/filesystem';
import create from './create';
import build from './build';
import list from './list';


export default new Module(null, [ filesystem ])
  .factory('client/create', create)
  .factory('client/build', build)
  .factory('client/list', list);