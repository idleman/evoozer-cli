
export default [
  '$invoke',
  'process',
  'workspace/config',
  ($invoke, process, getWorkspaceConfig) => {

    return function getClientConfig(name) {

      return getWorkspaceConfig()
        .then(config => {
          const { directories: workspaceDirectories } = config;
          const folder = (name ? `${name}/` : '');
          const directory = workspaceDirectories.client + folder;
          const build = workspaceDirectories.build + folder;
          const tmp = workspaceDirectories.tmp + (name ? `client/${name}/` : '');
          const directories = { build, tmp };
          return {
            directory,
            directories
          };
        });
    };
  }
];
