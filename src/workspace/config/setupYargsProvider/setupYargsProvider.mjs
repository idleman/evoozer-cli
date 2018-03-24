export default ['yargsProvider', yargsProvider => {
  yargsProvider.configure(['process', process => {

    const { stdout } = process;

    const printWorkspaceDetails = (result) => {
      const { name } = result;
      stdout.write(`Created workspace: "${name}".`);
    };

    yargsProvider.command({
      command: 'workspace',
      builder: yargs => {
        yargs
          .command({
            command: 'create [...args]',
            handler: ['$$argv', '$invoke', ($$argv, $invoke) => {
              return $invoke(['workspace/create',  createWorkspace => createWorkspace($$argv.name)])
                .then(printWorkspaceDetails);
            }]
          });
      }
    });

  }]);
}];