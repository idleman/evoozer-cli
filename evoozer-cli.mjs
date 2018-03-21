import Module from 'evoozer/Module';
import processNode from 'evoozer/Module/process-node';
import filesystemNode from 'evoozer/Module/filesystem-node';
import src from './src';

const app = new Module(null, [ src, processNode, filesystemNode ]);

const onSuccess = () => process.exit(0);
const onError = (err) => {
  console.error(err);
  process.exit(1);
};

const instance = app.createInstance();

instance.initiate()
  .then(onSuccess, onError);