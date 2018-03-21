export default ['yargsProvider', yargsProvider => {
  yargsProvider.configure(['process', process => {

    const { stdout } = process;

    const printWorkspaceDetails = (result) => {
      const { name, directory } = result;
      stdout.write(`Created ${name} at ${directory}.`);
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