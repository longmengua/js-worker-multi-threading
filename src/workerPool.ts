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
            worker.on('message', (message) => this.handleMessage(worker, message));
            worker.on('error', (err) => console.error(`❌ Worker error: ${err.message}`));
            worker.on('exit', (code) => {
                if (code !== 0) {
                    console.error(`❌ Worker stopped with exit code ${code}`);
                }
                this.markWorkerAsAvailable(worker);
            });
            this.workers.push(worker);
            this.availableWorkers.push(worker);
            this.onTotalWorkersChange(this.workers.length);
            this.onAvailableWorkersChange(this.availableWorkers.length);
            console.log(`👷 Worker created: (${this.workers.length}|${this.availableWorkers.length})`);
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
        this.markWorkerAsAvailable(worker); // Mark worker as available
    }

    private markWorkerAsAvailable(worker: Worker) {
        if (!this.availableWorkers.includes(worker)) {
            this.availableWorkers.push(worker);
            this.onAvailableWorkersChange(this.availableWorkers.length);
        }
    }

    public runTask(workerData: any) {
        if (this.availableWorkers.length === 0) {
            throw new Error('No available workers');
        }
        const worker = this.availableWorkers.pop();
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
