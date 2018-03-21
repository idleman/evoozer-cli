export default [
  '$invoke',
  'process',
  'env',
  'filesystem/readFile',
  'filesystem/createDirectory',
  ($invoke, process, env, readFile, createDirectory) => {

    const throwError = err => {
      throw err;
    };

    const getDefaultOptions = (currentOptions) => {
      const { name } = currentOptions;

      const directories = {
        'client': './client',
        'dist': './dist',
        'tmp': './tmp'
      };
      const { client = './client' } = directories;
      const main = client + (name ? `/${name}` : '');
      const cache = ''; // persistent cache between builds.
      const tmp = ''; // tmp folder,
      const dist = client + (name ? `/${name}` : '');

    };

    const setDefaults = currentOptions => {
      return Promise.resolve()
        .then(() => getDefaultOptions(currentOptions))
        .then(defaultOptions => Object.assign({}, defaultOptions, currentOptions));
    };

    return function getWorkspaceConfig() {
      return readFile(`${process.cwd()}/.evoozer`, 'json')
        .then(setDefaults, () => { throw new Error('Current folder is no workspace evoozer workspace') });
    };
  }
];
