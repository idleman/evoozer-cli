import path from 'path';

const { normalize } = path;

//path.normalize('/foo/bar//baz/asdf/quux/..');
export default [
  'env/exec',
  'client/config',
  'filesystem/appendFile',
  (exec, getClientConfig, appendFile) => {

    const getBuildInformation = (execInfo) => {
      const { stdout = '' } = execInfo;
      const lines = stdout.split('\n').map(val => val.trim());
      const [hash, version, buildAt] = lines.slice(0, 3)
        .map(val => (val.split(':')[1]).trim());

      return {
        hash,
        version,
        buildAt
      };
    };

    const updateBuildLog = (buildDirectory, name, buildInfo) => {
      const date =  (new Date()).toISOString();
      const buildLog = Object.assign({ date }, buildInfo);
      return appendFile(`${buildDirectory}.buildlog`, JSON.stringify(buildLog) + '\n')
        .then(() => buildInfo);
    };

    return function buildClient(options) {
      const { mode = 'development', name } = options;

      return getClientConfig(name)
        .then(config => {
          const output = config.directories.build;
          const input = config.directory;
          const cmd = `webpack-cli --mode ${mode} ${input} --output-path="${output}/" --output-filename="[hash].js" --module-bind js=babel-loader`;
          //const cwd = '../';
          const options = { };
          return exec(cmd, options)
            .then(getBuildInformation)
            .then(buildInfo => updateBuildLog(output, name, buildInfo))
            .then(buildInfo => Object.assign({}, buildInfo, { buildDirectory: output }))
        });
    };
  }
];