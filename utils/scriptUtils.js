import { spawn } from 'child_process';
import { createInterface } from 'readline';
export const createLock = () => {
    const lock = {};
    lock.p = new Promise((res, rej) => {
        lock.res = res;
        lock.rej = rej;
    });
    return lock;
};
export const useReadLine = (stdin, stdout) => {
    const rl = createInterface({ input: stdin, output: stdout });
    const asyncReadLine = async (question) => {
        const questionLock = createLock();
        rl.question(question, questionLock.res);
        return questionLock.p;
    };
    return asyncReadLine;
};
/**
 * Wait for a process to exit or for a process to reach a flag
 */
export const asyncProcess = (command, opts) => {
    const procLock = createLock();
    const subProc = spawn(command, opts);
    const { outputNeedsToEqual, ignoreErrors } = opts;
    if (outputNeedsToEqual) {
        subProc.stdout.on('data', data => {
            const strData = data.toString();
            console.log(strData);
            if (strData.includes(outputNeedsToEqual))
                procLock.res();
        });
    }
    else {
        subProc.on('exit', procLock.res);
        subProc.stdout.on('data', data => console.log(data.toString()));
    }
    subProc.stderr.on('data', (e) => {
        const strErr = e.toString();
        console.error(strErr);
        if (ignoreErrors)
            return;
        const nonErrors = [
            'Debugger attached.\n',
            'Waiting for the debugger to disconnect...\n',
            'DeprecationWarning:',
            'Cloning',
            'warning',
        ];
        for (const nonError of nonErrors) {
            if (strErr.includes(nonError))
                return;
        }
        procLock.rej(strErr);
    });
    return [procLock.p, subProc];
};
export const createKeyFileString = (input) => {
    let result = '';
    const inputKeys = Object.keys(input);
    for (const key of inputKeys) {
        result += `export const ${key} = '${input[key]}';\n`;
    }
    return result;
};
