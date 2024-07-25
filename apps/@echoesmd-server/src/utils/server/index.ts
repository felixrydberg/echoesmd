// import * as pm2 from "pm2";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pm2 = require('pm2');
let status = "stopped";

export const stopServer = async () => {
  return new Promise((resolve, reject) => {
    try {
      pm2.connect(async (error) => {
        if (error) {
          console.trace(error);
          process.exit(2);
        }
        pm2.stop('echoesmd-hocuspocus', function(err) {
          pm2.disconnect();
          if (err) {
            console.trace(err); 
            return reject(err);
          }
          status = "stopped";
          resolve({ status: "stopped" });
        });
      })
    } catch(error: unknown) {
      reject({
        status: "error",
        error: error,
      });
    }
  });
};

export const startServer = async () => {
  return new Promise((resolve, reject) => {
    try {
      console.log("Connecting to pm2")
      pm2.connect((error) => {
        console.log("Connected to pm2")
        if (error) {
          console.log(error);
          process.exit(2);
        }
        console.log("Starting pm2 process")
        pm2.start({
          name: 'echoesmd-hocuspocus',
          script: '../../index.ts',
          interpreter: 'ts-node',
        }, function(err) {
          pm2.disconnect();
          if (err) {
            console.trace(err);
            throw err;
          }
          status = "running";
          resolve({ status: "running" });
        });
      })
    } catch(error: unknown) {
      console.log(error)
      reject({
        status: "error",
        error: error,
      });
    }
  });
};

export const restartServer = async () => {
  return new Promise((resolve, reject) => {
    try {
      pm2.connect(async (error) => {
        if (error) {
          console.trace(error);
          process.exit(2);
        }
        pm2.restart('echoesmd-hocuspocus', function(err) {
          pm2.disconnect();
          if (err) {
            console.trace(err);
            throw err;
          }
          status = "running";
          resolve({ status: "running" });
        });
      })
    } catch(error: unknown) {
      reject({
        status: "error",
        error: error,
      });
    }
  });
}

export const getStatus = () => {
  return {
    status,
  };
};
