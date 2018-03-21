import Module from 'evoozer/Module';
import client from './client';
import workspace from './workspace';
//import config from './config';

export default new Module(null, [ workspace, client ]);
