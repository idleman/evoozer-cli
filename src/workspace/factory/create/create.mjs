export default [
  'env/exec',
  'filesystem/rename',
  'filesystem/remove',
  (exec, rename, remove) => {

    // we can download a tarball in the future, when the repository is public
    const WORKSPACE_GIT_REPOSITORY_NAME = 'evoozer-workspace';
    const WORKSPACE_GIT_REPOSITORY_URL = `https://github.com/idleman/${WORKSPACE_GIT_REPOSITORY_NAME}.git`;

    return function createWorkspaceDirectory(workspaceOptions) {
      const { name } = workspaceOptions;
      return Promise.resolve()
        .then(() => exec(`git clone --depth 1 --shallow-submodules ${WORKSPACE_GIT_REPOSITORY_URL}`))
        .then(() => remove(`${WORKSPACE_GIT_REPOSITORY_NAME}/.git`))
        .then(() => remove(`${WORKSPACE_GIT_REPOSITORY_NAME}/.gitignore`))
        .then(() => rename(WORKSPACE_GIT_REPOSITORY_NAME, name))
        .then(() => ({ name }));
    };
  }
];

/*

 const rl = readline.createInterface({
 input: process.stdin,
 output: process.stdout
 });

 const createDirectory = (path) => new Promise((resolve, reject) => fs.mkdir(path, err => err ? reject(err) : resolve(path)));
 const createFile = (path, content) => new Promise((resolve, reject) => fs.writeFile(path, content, err => err ? reject(err) : resolve({ path, content })));


 const createWorkspaceDirectory = workspaceName => {
 createDirectory(`${process.cwd()}/${workspaceName}/`)
 .then(path => createFile())
 }

 const createWorkspaceSubFolders = (workspaceDirectory) => {
 const directories = [
 `${workspaceDirectory}/node_modules`,
 `${workspaceDirectory}/client`,
 `${workspaceDirectory}/server`,
 `${workspaceDirectory}/database`,
 `${workspaceDirectory}/environment`
 ];
 return Promise.all(directories.map(createDirectory))
 .then(paths => [workspaceDirectory].concat(paths));
 };

 const getQuestions = () => Promise.resolve([
 { title: 'Workspace name: ', invoke: ['$$answer', (name) => ({ name })] }
 ]);

 const askQuestionsHelper = ($$readlineInterface, $$questions, $$index, $$shared) => {
 return !$$questions[$$index] ? $$shared : new Promise((resolve, reject) => {
 const { title, invoke } = $$questions[$$index];
 $$readlineInterface.question(title, ($$answer) => {
 $invoke(invoke, { $$answer, $$questions, $$index, $$shared, $$readlineInterface })
 .then(obj => merge($$shared, obj))
 .then(() => askQuestionsHelper(readlineInterface, $$questions, $$index + 1, $$shared))
 .then(resolve, reject);
 });
 });
 };


 const askQuestions = (readlineInterface, $$questions) => {
 return new Promise((resolve, reject) => {
 const $$shared = {};
 const $$index = 0;
 const complete = (err) => {
 readlineInterface.close();
 return (err) ? reject(err) : resolve($$shared);
 };
 askQuestionsHelper(readlineInterface, $$questions, $$index, $$shared)
 .then(complete.bind(null, null), complete);
 });
 };

 const createReadlineInterface = () => readline.createInterface({ input: process.stdin, output: process.stdout, terminal: false });
 //
 // return Promise.all([createReadlineInterface(), getQuestions() ])
 //   .then(args => askQuestions(...args))
 */