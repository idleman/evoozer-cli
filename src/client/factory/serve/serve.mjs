import child_process from 'child_process';

const { spawn } = child_process;
export default [
  'env/exec',
  'workspace/config',
  'client/config',
  'client/status',
  'filesystem/createDirectory',
  'filesystem/writeFile',
  (exec, getWorkspaceConfig, getClientConfig, getClientStatus, createDirectory, writeFile) => {

    const toAddPublicDirectoryCall = (publicDirectory) => {
      return `.addPublicDirectory('${publicDirectory}')`;
    };

    const createWraperIndexFile = (tmp, appSource, entryScript, publicDirectories = []) => {
      const content =`import Module from 'evoozer/Module';
import WebApplication from 'evoozer/Module/web-application';
import path from 'path';
import src from '${appSource.replace(/\/$/, '')}';


const app = new Module('dentalCareWebApplication', [ WebApplication, src ])
  .config(['webApplicationProvider', webApplicationProvider => {
    webApplicationProvider
      ${publicDirectories.map(toAddPublicDirectoryCall).join('\n')}
      .addServer({ host: 'localhost', port: 8080 })
  }])
  .config(['routerProvider', routerProvider => {
    const script = [
     { src: '${entryScript}', async: true }
    ];
    const head = { script }; 
    routerProvider
      .when('/*', { head }); 
  }])
  .run(['webApplication', webApplication => {
    const onListening = servers => console.log('Server listening on ', servers.map(({ host, port }) => host + ':' + port).join(', '));
    const onError = err => {
      console.error(err);
      process.exit(1)
    };
    return webApplication.start()
      .then(onListening)
      .then(null, onError);
  }]);

const instance = app.createInstance();

instance.initiate()
  .then(null, console.error.bind(console));`;
      const src = `${tmp}index.mjs`;
      return writeFile(src, content, 'utf8');
    };

    const createWraperPackageJsonFile = (tmp) => {
      const content = { main: "./index" };
      const src = `${tmp}package.json`;
      return writeFile(src, content, 'json');
    };

    const createWrapperFolder = (config, serveOptions) => {
      const { build, tmp } = config.directories;
      const serverBuildDir = `${tmp}server-build/`;
      return Promise.resolve()
        .then(() => createDirectory(tmp + '../../'))
        .then(() => createDirectory(tmp + '../'))
        .then(() => createDirectory(tmp))
        .then(() => createDirectory(serverBuildDir))
        .then(() => getClientStatus(serveOptions))
        .then(status => {
          const { hash } = status;
          const appSource = `../../../../${config.directory}`;
          const publicDirectories = [build, `${appSource}public/`];
          const entryScript = `${hash}.js`;
          return Promise.all([
            createWraperIndexFile(serverBuildDir, appSource, entryScript, publicDirectories),
            createWraperPackageJsonFile(serverBuildDir)
          ])
        })
        .then(() => serverBuildDir);
    };

    return function serveClient(serveOptions) {
      const { mode = 'development', name } = serveOptions;
      return getClientConfig(name)
        .then(config => {
          return createWrapperFolder(config, serveOptions)
            .then(inputPath => {
              return exec(`node --experimental-modules ${inputPath}`);

                //.then(.con)
              // const output = config.directories.build;
              // const cmd = `webpack-cli --mode ${mode} ${inputPath} --output-path="${output}" --output-filename="[hash].js" --module-bind js=babel-loader`;
              // const options = { };
              // return exec(cmd)
              //   .then(getBuildInformation)
              //   .then(buildInfo => updateBuildLog(output, name, buildInfo))
              //   .then(buildInfo => Object.assign({}, buildInfo, { buildDirectory: output }))
            });
        });
    };
  }
];