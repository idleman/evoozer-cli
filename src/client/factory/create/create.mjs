import path from 'path';

const { resolve } = path;

export default [
  'env/exec',
  'client/config',
  'filesystem/rename',
  'filesystem/remove',
  'filesystem/createDirectory',
  (exec, getClientConfig, rename, remove, createDirectory) => {

    // we can download a tarball in the future, when the repository is public
    const WORKSPACE_GIT_REPOSITORY_NAME = 'evoozer-workspace-client';
    const WORKSPACE_GIT_REPOSITORY_URL = `https://github.com/idleman/${WORKSPACE_GIT_REPOSITORY_NAME}.git`;


    return function createClient(name) {
      return getClientConfig()
        .then(config => {
          const cwd = config.directory;
          const options = { cwd };
          return createDirectory(config.directory)
            .then(() => exec(`git clone --depth 1 --shallow-submodules ${WORKSPACE_GIT_REPOSITORY_URL}`, options))
            .then(() => remove(`${cwd}${WORKSPACE_GIT_REPOSITORY_NAME}/.gitignore`))
            .then(() => rename(`${cwd}${WORKSPACE_GIT_REPOSITORY_NAME}`, `${cwd}${name}`))
            .then(() => ({ name }));
        });
    };
  }
];