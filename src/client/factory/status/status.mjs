import path from 'path';

const { normalize } = path;

//path.normalize('/foo/bar//baz/asdf/quux/..');
export default [
  'env/exec',
  'client/config',
  'filesystem/readFile',
  (exec, getClientConfig, readFile) => {


    const getLastBuildLog = (buildDirectory) => {
      const file = `${buildDirectory}.buildlog`;
      const onData = data => {
        const item = data.split('\n')
          .filter(line => !!line)
          .sort()
          .pop();
        return JSON.parse(item);
      };

      return readFile(file, 'utf8')
        .then(onData, error => ({ error }));
    };

    return function getClientStatus(options) {
      const { name } = options;

      return getClientConfig(name)
        .then(config => {
          const output = config.directories.build;
          return getLastBuildLog(output);
        });
    };
  }
];