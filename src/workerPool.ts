import { Worker } from 'worker_threads';
import { resolve } from 'path';
import { cpus } from 'os';

const numCores = cpus().length;
const raceOverFlag = new Int32Array(new SharedArrayBuffer(4));
const workerFile = resolve(__dirname, './workers/race.js'); // Reference JavaScript file

export class WorkerPool {
    private workers: Worker[] = [];
    private availableWorkers: Worker[] = [];
    private onTotalWorkersChange: (totalWorkers: number) => void = () => { };
    private onAvailableWorkersChange: (availableWorkers: number) => void = () => { };

    constructor(onAvailableWorkersChange?: (availableWorkers: number) => void) {
        if (onAvailableWorkersChange) {
            this.onAvailableWorkersChange = onAvailableWorkersChange;
        }

        for (let i = 0; i < numCores; i++) {
            const worker = new Worker(workerFile);
            this.workers.push(worker);
            this.availableWorkers.push(worker);
            this.onTotalWorkersChange(this.workers.length);
            this.onAvailableWorkersChange(this.availableWorkers.length);
            console.log(`Totoal Workers: ${this.workers.length}`);
        }
    }

    private markWorkerAsAvailable(worker: Worker) {
        if (!this.availableWorkers.includes(worker)) {
            this.availableWorkers.push(worker);
            this.onAvailableWorkersChange(this.availableWorkers.length);
        }
    }

    private getWorker() {
        let worker: any = undefined;
        while (this.availableWorkers.length > 0) {
            worker = this.availableWorkers.pop();
            if (worker) {
                return worker
            }
        }
        throw new Error('👷 No available worker');
    }

    /***
     * in order to make this worker pool logic clean 
     * function handleMessage, which processing biz logic will be injected
    */
    public runTask(workerData: any, handleMessage?: any) {
        const worker = this.getWorker();
        worker.on('message', (message: any) => {
            try {
                handleMessage && handleMessage(worker, message)
            } catch (e) {
                console.log(e);
            }
            this.markWorkerAsAvailable(worker); // Mark worker as available
        });
        worker.on('error', (err: { message: any; }) => console.error(`❌ Worker error: ${err.message}`));
        worker.on('exit', (code: number) => {
            if (code !== 0) {
                console.error(`❌ Worker stopped with exit code ${code}`);
            }
            this.markWorkerAsAvailable(worker);
        });
        worker?.postMessage(workerData);
        this.onAvailableWorkersChange(this.availableWorkers.length);
    }

    public getTotalWorkers(): number {
        return this.workers.length;
    }

    public getAvailableWorkers(): number {
        return this.availableWorkers.length;
    }

    public setTotalWorkersChangeCallback(callback: (totalWorkers: number) => void) {
        this.onTotalWorkersChange = callback;
    }

    public setAvailableWorkersChangeCallback(callback: (availableWorkers: number) => void) {
        this.onAvailableWorkersChange = callback;
    }
}
