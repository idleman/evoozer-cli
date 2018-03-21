import path from 'path';

const { resolve } = path;

export default [
  '$invoke',
  'process',
  'workspace/config',
  'filesystem/readDirectory',
  ($invoke, process, getWorkspaceConfig, readDirectory) => {

    const throwError = err => {
      throw err;
    };

    const getClientContainerDirectory = () => {
      return readFile(`${process.cwd()}/.evoozer`, 'json')
        .then(null, throwError.bind(null, new Error('Current folder is no workspace evoozer workspace')))
        .then(config => {
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

    const clientNameRegex = /^[a-zA-Z0-9\-]+$/;
    const isValidClientName = name => clientNameRegex.test(name);


    return () => {
      return Promise.resolve()
        .then(getWorkspaceConfig)
        .then(config => readDirectory(config.directories.client).then(null, err => []))
        .then(files => files.filter(isValidClientName));
    };
  }
];