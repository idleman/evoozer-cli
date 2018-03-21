import Module from 'evoozer/Module';
import filesystem from 'evoozer/Module/filesystem';
import env from 'evoozer/Module/env';
import create from './create';
import config from './config';

export default new Module(null, [ filesystem, env ])
  .factory('workspace/create', create)
  .factory('workspace/config', config)