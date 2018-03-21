import assert from 'assert';
import Module from '../../evoozer/Module';
import evoozerCliModule from './evoozer-cli.mjs';

const { strictEqual } = assert;

describe('evoozer-cli/client', function() {

  function createModule(args = []) {
    return new Module(null, [ evoozerCliModule ])
      .config(['processProvider', processProvider => processProvider.set({ args: ['node', '/evoozer-cli.mjs'].concat(args) })])
  }

  it('should export a module instance', function() {
    strictEqual(evoozerCliModule instanceof Module, true);
  });

  it('should be able to create a new website', function(next) {
    const args = ['create', 'website', 'my-website'];
    const module = createModule();
    module.run(['process', $process => strictEqual($process.hrtime, process.hrtime)]);

    const instance = module.createInstance();
    instance.initiate()
      .then(next.bind(null, null), next);
  });

});