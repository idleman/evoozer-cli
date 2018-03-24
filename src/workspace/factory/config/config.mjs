
export default [
  '$invoke',
  'process',
  'env',
  'filesystem/readFile',
  'filesystem/createDirectory',
  ($invoke, process, env, readFile, createDirectory) => {


    const defaultDirectories = {
      'client': 'client/',
      'build': 'build/',
      'tmp': 'tmp/'
    };

    const setDefaults = (currentOptions) => {
      const directories = Object.assign({}, defaultDirectories, currentOptions.directories);
      return {
        directories
      };
    };

    return function getWorkspaceConfig() {
      return readFile('.evoozer', 'json')
        .then(setDefaults, () => { throw new Error('Current folder is no workspace evoozer workspace') });
    };
  }
];
