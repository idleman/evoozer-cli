import Module from 'evoozer/Module';
import yargs from 'evoozer/Module/yargs';
import setupYargsProvider from './setupYargsProvider';

export default new Module(null, [ yargs ])
  .config(setupYargsProvider)
