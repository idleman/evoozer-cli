import path from 'path';

const { normalize } = path;

//path.normalize('/foo/bar//baz/asdf/quux/..');
export default [
  'env/exec',
  'client/config',
  (exec, getClientConfig) => {


    return function serveClient(options) {
      const { mode = 'development', name } = options;

      return getClientConfig(name)
        .then(config => {
          const output = config.directories.build;
          const input = config.directory;
          const cmd = `webpack-cli --mode ${mode} ${input} --output-path="${output}/" --output-filename="[hash].js" --module-bind js=babel-loader`;

          //const cwd = '../';

          const options = { };
          return exec(cmd, options);
        });
    };
  }
];