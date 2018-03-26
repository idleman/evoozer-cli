import child_process from 'child_process';
import mkdirRecursive from 'mkdir-recursive';
const { mkdir } = mkdirRecursive;

//path.normalize('/foo/bar//baz/asdf/quux/..');


const createDirectory = (path, cb) => new Promise((resolve, reject) => mkdir(path, err => err ? reject(err) : resolve()));

export default [
  'env/exec',
  'workspace/config',
  'client/config',
  'client/status',
  //'filesystem/createDirectory',
  'filesystem/writeFile',
  (exec, getWorkspaceConfig, getClientConfig, getClientStatus, writeFile) => {

    const toAddPublicDirectoryCall = (publicDirectory) => {
      return `.addPublicDirectory('${publicDirectory}')`;
    };

    const createWraperIndexFile = (opt = {}) => {
      const {
        ssl,
        source,
        directory,
        entryScript,
        clientDirectory,
        publicDirectories
      } = opt;


      const key = ssl.key ? `${clientDirectory}/${ssl.key}` : '';
      const cert = ssl.cert ? `${clientDirectory}/${ssl.cert}` : '';

      const content =`import Module from 'evoozer/Module';
import WebApplication from 'evoozer/Module/web-application';
import path from 'path';
import src from '${source.replace(/\/$/, '')}';
import fs from 'fs';

const app = new Module(null, [ WebApplication, src ])
  .config(['webApplicationProvider', webApplicationProvider => {
    console.log('CConfiguring webApplicationProvider');
    const port = (process.env.PORT || 8080)|0;
    const keyPath = ${JSON.stringify(key)};
    const certPath = ${JSON.stringify(cert)};
    const key = keyPath ? fs.readFileSync(keyPath) : null;
    const cert = certPath ? fs.readFileSync(certPath) : null;
    console.log('webApplicationProvider port: ', port);
    webApplicationProvider
      ${publicDirectories.map(toAddPublicDirectoryCall).join('\n')}
      .addServer({ port, key, cert })
  }])
  .config(['routerProvider', routerProvider => {
    const script = [
     { src: '${entryScript}', defer: true }
    ];
    const head = { script }; 
    routerProvider
      .when('/*', { head }); 
  }])
  .run(['webApplication', (webApplication) => {
    const onListening = servers => {
      console.log('Server listening on ', servers.map(({ host, port }) => host + ':' + port).join(', '));
      process.on('SIGTERM', () => {
        console.log('SIGTERM RECEIBVED!');
        const closeServer = server => new Promise((resolve, reject) => server.close(err => err ? reject(err) : resolve()));
        const terminateProcess = (err) => {
          if(err) {
            console.error(err);
            return process.exit(1);
          }
          return process.exit(0);
        };
        return Promise.all(servers.map(closeServer))
          .then(terminateProcess.bind(null, null), terminateProcess)
      });
    };
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
      const src = `${directory}index.mjs`;
      return writeFile(src, content, 'utf8');
    };

    const createWraperPackageJsonFile = (tmp) => {
      const content = { main: "./index" };
      const src = `${tmp}package.json`;
      return writeFile(src, content, 'json');
    };

    const createWrapperFolder = (config, serveOptions) => {
      const clientDirectory = config.directory;
      const { build, tmp } = config.directories;
      const buildDirectory = `${tmp}server-build/`;
      return Promise.resolve()
        .then(() => createDirectory(buildDirectory))
        .then(() => getClientStatus(serveOptions))
        .then(status => {
          const { hash } = status;
          const source = `../../../../${config.build}`;
          const publicDirectories = [build, `${source}public/`];
          const entryScript = `${hash}.js`;
          const { serverOptions = {} } = config;
          const { ssl = {} } = serverOptions;
          return Promise.all([
            createWraperPackageJsonFile(buildDirectory),
            createWraperIndexFile({
              ssl,
              source,
              entryScript,
              buildDirectory,
              clientDirectory,
              publicDirectories
            })
          ])
        })
        .then(() => buildDirectory);
    };

    return function serveClient(serveOptions) {
      const { NODE_ENV = 'development' } = process.env;
      const { mode = NODE_ENV, name } = serveOptions;
      return getClientConfig(name)
        .then(config => {
          return createWrapperFolder(config, serveOptions)
            .then(inputPath => {
              const argv = ['--experimental-modules', inputPath];
              return child_process.spawn('node', argv, { stdio: 'inherit' });

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