import { Worker } from 'worker_threads';
import { resolve } from 'path';
import { cpus } from 'os';

const numCores = cpus().length;
const raceOverFlag = new Int32Array(new SharedArrayBuffer(4));
const workerFile = resolve(__dirname, './workers/race.js'); // Reference JavaScript file

class WorkerPool {
    private workers: Worker[] = [];
    private availableWorkers: Worker[] = [];

    constructor() {
        for (let i = 0; i < numCores; i++) {
            const worker = new Worker(workerFile);
            worker.on('message', (message) => this.handleMessage(worker, message));
            worker.on('error', (err) => console.error(`❌ Worker error: ${err.message}`));
            worker.on('exit', (code) => {
                if (code !== 0) {
                    console.error(`❌ Worker stopped with exit code ${code}`);
                }
                this.removeWorker(worker);
            });
            this.workers.push(worker);
            this.availableWorkers.push(worker);
        }
    }

    private handleMessage(worker: Worker, message: any) {
        const { name, distance } = message;
        if (Atomics.load(raceOverFlag, 0) === 1) {
            return; // 比賽已經結束
        }
        if (distance == 100) {
            console.log(`🏆 ${name} 贏得比賽！`);
            Atomics.store(raceOverFlag, 0, 1); // 設置比賽結束標誌
        } else {
            console.log(`🚀 ${name} 跑了 ${distance} 公尺`);
        }
        this.availableWorkers.push(worker); // Mark worker as available
    }

    private removeWorker(worker: Worker) {
        this.workers = this.workers.filter(w => w !== worker);
        this.availableWorkers = this.availableWorkers.filter(w => w !== worker);
    }

    public runTask(workerData: any) {
        if (this.availableWorkers.length === 0) {
            throw new Error('No available workers');
        }
        const worker = this.availableWorkers.pop();
        worker?.postMessage(workerData);
    }
}

export const workerPool = new WorkerPool();
