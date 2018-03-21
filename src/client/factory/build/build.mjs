import path from 'path';

const { resolve } = path;

export default [
  '$invoke',
  'process',
  'filesystem/createDirectory',
  'filesystem/createFile',
  'filesystem/readFile',
  ($invoke, process, createDirectory, createFile, readFile) => {


    return (name) => {
      console.log('build: ' + name);
    };
  }
];