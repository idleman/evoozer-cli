import chokidar from 'chokidar';
// One-liner for current directory, ignores .dotfiles

//path.normalize('/foo/bar//baz/asdf/quux/..');

// Returns a function, that, when invoked, will only be triggered at most once
// during a given window of time. Normally, the throttled function will run
// as much as it can, without ever going more than once per `wait` duration;
// but if you'd like to disable the execution on the leading edge, pass
// `{leading: false}`. To disable execution on the trailing edge, ditto.
function throttle(func, wait, options) {
  var context, args, result;
  var timeout = null;
  var previous = 0;
  if (!options) options = {};
  var later = function() {
    previous = options.leading === false ? 0 : Date.now();
    timeout = null;
    result = func.apply(context, args);
    if (!timeout) context = args = null;
  };
  return function() {
    var now = Date.now();
    if (!previous && options.leading === false) previous = now;
    var remaining = wait - (now - previous);
    context = this;
    args = arguments;
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };
};

export default [
  'process',
  'client/config',
  'client/build',
  'client/serve',
  'client/status',
  (process, getClientConfig, buildClient, serveClient, getClientStatus) => {
    const { stdout } = process;


    return function watchClient(watchOptions) {
      const { name } = watchOptions;

      const printBuildResult = (function() {
        let counter = 0;
        return (result) => {
          const { date, hash, buildAt, error, server } = result;

          if(error) {
            stdout.write(`[${++counter}]\t${error}\n`);
            return;
          }

          if(server) {
            stdout.write(`[${++counter}]\tserver:\t${server}\n`);
            return;
          }


          stdout.write(`[${++counter}]\t${hash}\t${date}\t${buildAt}\n`);
        };
      })();

      const build = (function() {
        const queue = [];
        let tmpPromise = null;
        const notify = (result) => {
          if(result) {
            tmpPromise = null;
            printBuildResult(result);
          }
          if(queue.length === 0) {
            tmpPromise = null;
            return Promise.resolve(result);
          }
          queue.length = 0;
          return buildClient(watchOptions)
            .then(notify, (error) => notify({ error }));
        };

        const addRequest = () => {
          queue.push({});
          if(tmpPromise) {
            return tmpPromise;
          }
          tmpPromise = notify();
          return tmpPromise;
        };

        return throttle(addRequest, 250);
      }());


      const updateServer = (function() {
        const queue = [];
        let childProcessPromise = null;

        const notify = () => {
          const request = queue.pop();
          if(!request) {
            return;
          }
          queue.length = 0;
          if(childProcessPromise) {
            childProcessPromise.then(childProcess => {
              printBuildResult({ server: 'kill' });
              childProcess.kill();
              childProcessPromise = null;
            });
            return;
          }

          const addEventListeners = (childProcess) => {
            printBuildResult({ server: 'success' });
            childProcess.on('exit', code => {
              queue.push({});
              notify();
            })
          };
          const onError = (error) => {
            printBuildResult({ error });
            childProcessPromise = null;
          };
          printBuildResult({ server: 'start' });
          childProcessPromise = serveClient(watchOptions);
          childProcessPromise.then(addEventListeners, onError);
        };

        return (version) => {
          queue.push({ version });
          return notify();
        };
      })();

      const checkCurrentBuildVersion = (function() {
        let currentBuildVersion = {};
        return () => {
          return getClientStatus(watchOptions)
            .then(buildLog => {
              const nextBuildVersion = buildLog.hash;
              if(currentBuildVersion === nextBuildVersion) {
                return;
              }
              currentBuildVersion = buildLog.hash;
              return updateServer(currentBuildVersion);
            });
        };
      })();

      return Promise.resolve()
        .then(build)
        .then(() => getClientConfig(name))
        .then(config => {
          return new Promise(() => {
            // watch should never resolve...
            //return;*/
            const clientBuildDirectory = config.directories.build;
            const clientBuildLogFile = `${clientBuildDirectory}.buildlog`;
            const clientBuildWatcher = chokidar.watch(clientBuildLogFile);

            clientBuildWatcher.on('all', () => checkCurrentBuildVersion());
            clientBuildWatcher.on('error', console.log.bind(console));

            const clientAppDirectory = config.directory;
            const clientAppWatcher = chokidar.watch(clientAppDirectory);

            clientAppWatcher.on('all', build);
          });
        });
    };
  }
];