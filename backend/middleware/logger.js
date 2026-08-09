import { format } from 'date-fns';
import { v4 as uuid } from 'uuid';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { promises as fsPromises } from 'fs';

// Get the directory name of the current module. Must stay OS-agnostic —
// forcing backslashes here broke path.join() on Linux (e.g. Docker), where
// it silently resolved to the wrong directory instead of throwing.
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const logEvents = async (message, logFileName) => {
    const dateTime = format(new Date(), 'yyyyMMdd\tHH:mm:ss');
    const logItem = `${dateTime}\t${uuid()}\t${message}\n`;

    try {
        const logsDir = path.join(__dirname, '..', 'logs');
        if (!fs.existsSync(logsDir)) {
            await fsPromises.mkdir(logsDir);
        }
        await fsPromises.appendFile(path.join(logsDir, logFileName), logItem);
    } catch (err) {
        console.log(err);
    }
};

export const logger = (req, res, next) => {
    logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, 'reqLog.log');
    console.log(`${req.method} ${req.path}`);
    next();
};

