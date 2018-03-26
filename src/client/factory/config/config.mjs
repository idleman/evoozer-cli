
export default [
  '$invoke',
  'process',
  'workspace/config',
  'filesystem/readFile',
  ($invoke, process, getWorkspaceConfig, readFile) => {

    return function getClientConfig(name) {

      return getWorkspaceConfig()
        .then(config => {
          const { directories: workspaceDirectories } = config;
          const folder = (name ? `${name}/` : '');
          const directory = workspaceDirectories.client + folder;
          const build = workspaceDirectories.build + folder;
          const tmp = workspaceDirectories.tmp + (name ? `client/${name}/` : '');
          const directories = { build, tmp };
          const defaultConfig = {
            directory,
            directories
          };
          return readFile(directory + 'package.json', 'json')
            .then(opt => Object.assign({}, opt, defaultConfig), () => defaultConfig);
        });
    };
  }
];
