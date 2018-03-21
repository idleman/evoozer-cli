
export default [
  '$invoke',
  'process',
  'workspace/config',
  ($invoke, process, getWorkspaceConfig) => {

    const throwError = err => {
      throw err;
    };

    return function getClientConfig(name) {
      return Promise.resolve()
        .then(getWorkspaceConfig)
        .then(config => {
          const { directories = {} } = config;
          const { client = './client' } = directories;
          const main = client + (name ? `/${name}` : '');
          const cache = ''; // persistent cache between builds.
          const tmp = ''; // tmp folder,
          const dist = client + (name ? `/${name}` : '');

          return {
            directory
          }
        });
    };
  }
];
