import path from 'path';

const { resolve } = path;

export default [
  '$invoke',
  'process',
  'workspace/config',
  'filesystem/createDirectory',
  'filesystem/createFile',
  ($invoke, process, getWorkspaceConfig, createDirectory, createFile) => {

    const throwError = err => {
      throw err;
    };

    const getClientContainerDirectory = () => {
      return getWorkspaceConfig().then(config => {
        const { directories = {} } = config;
        const { client = './client' } = directories;
        const clientDirectory = resolve(process.cwd(), client);
        const returnClientDirectory = () => clientDirectory;
        const onError = err => (err && err.code === 'EEXIST')? clientDirectory : throwError(new Error(`Failed to create folder: "${clientDirectory}"`));
        return createDirectory(clientDirectory)
          .then(returnClientDirectory, onError);
      });
    };

    const createClientDirectory = (clientDirectory, name) => {
      const directory = resolve(clientDirectory, name)
      const packageInfo = { name };

      return Promise.resolve(directory)
        .then(createDirectory)
        .then(path => createFile(`${path}/package.json`, JSON.stringify(packageInfo, null, '  ')))
        .then(() => ({ directory, name }));
    };

    return (name) => {
      return Promise.resolve()
        .then(getClientContainerDirectory)
        .then(clientDirectory => createClientDirectory(clientDirectory, name))
    };
  }
];