import path from 'path';
import mkdirRecursive from 'mkdir-recursive';
const { mkdir } = mkdirRecursive;

//path.normalize('/foo/bar//baz/asdf/quux/..');


const createDirectory = (path, cb) => new Promise((resolve, reject) => mkdir(path, err => err ? reject(err) : resolve()));

export default [
  'env/exec',
  'client/config',
  //'filesystem/createDirectory',
  'filesystem/appendFile',
  'filesystem/writeFile',
  (exec, getClientConfig, appendFile, writeFile) => {

  const createDevelopmentIndexHtmlFile = (buildDirectory, version)  => {
    const content =`<!DOCTYPE html><html><head><script src="${version}.js" defer></script></head><body></body></html>`;
    const src = `${buildDirectory}index.html`;
    return writeFile(src, content, 'utf8');
  };

    const createWraperIndexFile = (tmp, appSource) => {
      const content =`import Module from 'evoozer/Module';
import src from '${appSource.replace(/\/$/, '')}';
import router from 'evoozer/Module/router';
import view from 'evoozer/Module/view-react-dom';
import location from 'evoozer/Module/location-browser';

const renderApp = ['router', 'view', 'view/hydrate', 'view/render', function renderApp(Router, View, hydrate, render) {
  let container = document.getElementById('app-root');
  console.log('container', container);
  let renderOrHydrate = hydrate;
  if(!container) {
    renderOrHydrate = render;
    container = document.createElement('div');
    document.body.appendChild(container);
  }
  const element = View.createElement(Router, {}, null);
  renderOrHydrate(element, container);
}];

const app = new Module(null, [ router, src, view, location ])
  .run(renderApp);

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

    const createWrapperFolder = config => {
      const { tmp } = config.directories;
      const browserBuildDir = `${tmp}browser-build/`;
      return createDirectory(browserBuildDir)
        .then(() => {
          const appSource = `../../../../${config.directory}`;
          return Promise.all([createWraperIndexFile(browserBuildDir, appSource), createWraperPackageJsonFile(browserBuildDir)])
            .then(() => browserBuildDir);
        });
    };

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
        .then(() => buildLog);
    };

    return function buildClient(options) {
      const { NODE_ENV = 'development' } = process.env;
      const { mode = NODE_ENV, name } = options;

      return getClientConfig(name)
        .then(config => {
          return createWrapperFolder(config)
            .then(inputPath => {
              const output = config.directories.build;
              const cmd = `webpack-cli --mode ${mode} ${inputPath} --output-path="${output}" --output-filename="[hash].js" --module-bind js=babel-loader`;
              //const cwd = '../';
              const options = { };
              console.log('buildClient:', cmd);
              return exec(cmd, options)
                .then(getBuildInformation)
                .then(buildInfo => updateBuildLog(output, name, buildInfo))
                .then(buildInfo => Object.assign({}, buildInfo, { buildDirectory: output }))
                .then(buildData => {
                  return buildData;
                  return createDevelopmentIndexHtmlFile(output, buildData.hash)
                    .then(() => buildData);
                })
            });
        });
    };
  }
];