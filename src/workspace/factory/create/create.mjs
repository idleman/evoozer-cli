
const workspaceDirectoryNames = [
  'client',
  'server',
  'database',
  'environment',
  'tmp',
  'build'
];

const ignoreList = [
  { path: 'logs' },
  { path: '*.log' },
  { path: 'npm-debug.log*' },
  { path: 'yarn-debug.log*' },
  { path: 'yarn-error.log*' },

  { comment: 'Runtime data' },
  { path: 'pids' },
  { path: '*.pid' },
  { path: '*.seed' },
  { path: '*.pid.lock' },

  { comment: 'Directory for instrumented libs generated by jscoverage/JSCover' },
  { path: 'lib-cov' },

  { comment: 'Coverage directory used by tools like istanbul' },
  { path: 'coverage' },

  { comment: 'nyc test coverage' },
  { path: '.nyc_output' },

  { comment: 'Grunt intermediate storage (http://gruntjs.com/creating-plugins#storing-task-files)' },
  { path: '.grunt' },

  { comment: 'Bower dependency directory (https://bower.io/)' },
  { path: 'bower_components' },

  { comment: 'node-waf configuration' },
  { path: '.lock-wscript' },

  { comment: 'Compiled binary addons (https://nodejs.org/api/addons.html)' },
  { path: 'build/Release' },

  { comment: 'Dependency directories' },
  { path: 'node_modules/' },
  { path: 'jspm_packages/' },

  { comment: 'Typescript v1 declaration files' },
  { path: 'typings/' },

  { comment: 'Optional npm cache directory' },
  { path: '.npm' },

  { comment: 'Optional eslint cache' },
  { path: '.eslintcache' },

  { comment: 'Optional REPL history' },
  { path: '.node_repl_history' },


  { comment: 'Output of "npm pack"' },
  { path: '*.tgz' },

  { comment: 'Yarn Integrity file' },
  { path: '.yarn-integrity' },

  { comment: 'dotenv environment variables file' },
  { path: '.env' },

  { comment: 'next.js build output' },
  { path: '.next' },

  { comment: 'Ignore temponary files' },
  { path: 'tmp/' }
];

const isTruthy = item => !!item;

const toGitIgnoreLine = (item) => {
  const { comment, path } = item;
  return [comment ? `# ${comment}` : '', path].filter(isTruthy).join('\n');
};

export default [
  '$invoke',
  'process',
  'filesystem/createDirectory',
  'filesystem/createFile',
  ($invoke, process, createDirectory, createFile) => {


    const createGitIgnore = (workspaceDirectory) => {
      const content = ignoreList.map(toGitIgnoreLine).join('');
      const path = `${workspaceDirectory}/.gitignore`
      return ;
    };

    const createWorkspaceDirectories = workspaceDirectory => {
      const directories = workspaceDirectoryNames.map(folder => `${workspaceDirectory}/${folder}`);
      return Promise.all(directories.map(createDirectory))
        .then(paths => [workspaceDirectory].concat(paths));
    };

    const createWorkspaceDirectory = name => {
      const directory = `${process.cwd()}/${name}/`;
      const directoryNames = [
        'dist',
        'client'
      ]; //, 'server', 'database', 'database', 'environment'];
      const directories = workspaceDirectoryNames.reduce((map, name) => Object.assign({}, map, { [name]: `./${name}` }), {});
      const packageInfo = { name, directories /*,remotes */ };

      return Promise.resolve(directory)
        .then(createDirectory)
        .then(path => createFile(`${path}/.evoozer`, JSON.stringify(packageInfo, null, '  ')))
        .then(() => ({ directory, name }));
    };

    return (name) => {

      return Promise.resolve(name)
        .then(createWorkspaceDirectory);
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