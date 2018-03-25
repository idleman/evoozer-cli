import chokidar from 'chokidar';
// One-liner for current directory, ignores .dotfiles

//path.normalize('/foo/bar//baz/asdf/quux/..');
export default [
  'process',
  'client/config',
  'client/build',
  'client/status',
  (process, getClientConfig, buildClient, getClientStatus) => {
    const { stdout } = process;


    return function watchClient(watchOptions) {
      const { name } = watchOptions;

      const printBuildResult = (function() {
        let counter = 0;
        return (result) => {
          const { date, hash, buildAt, error } = result;

          if(error) {
            stdout.write(`[${++counter}]\t${error}\n`);
            return;
          }
          stdout.write(`[${++counter}]\t${hash}\t${date}\t${buildAt}\n`);
        };
      })();

      const build = (function() {
        const queue = [];

        const notify = (result) => {
          if(result) {
            printBuildResult(result);
          }
          if(queue.length === 0) {
            return result;
          }
          queue.length = 0;
          return buildClient(watchOptions)
            .then(notify, (error) => notify({ error }));
        };

        return () => {
          queue.push({});
          return setTimeout(notify.bind(null, null), 250);
        };
      }());


      const updateServer = buildVersion => {
        console.log('run serve here', buildVersion);
      };

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