import path from 'path';

const { resolve } = path;

export default [
  '$invoke',
  'process',
  'filesystem/createDirectory',
  'filesystem/createFile',
  'filesystem/readFile',
  ($invoke, process, createDirectory, createFile, readFile) => {

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

    return (name) => {
      console.log('testting: ' + name);
      return Promise.resolve({
        abc: 123
      })
    };
  }
];