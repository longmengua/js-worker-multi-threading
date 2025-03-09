import { Worker } from 'worker_threads';

const raceLength = 100; // 比賽距離
const sharedBuffer = new SharedArrayBuffer(4); // 共享變數
const raceOverFlag = new Int32Array(sharedBuffer);
raceOverFlag[0] = 0; // 初始化比賽結束標誌

const horses = [
    { name: 'Ａ' },
    { name: 'Ｂ' },
    { name: 'Ｃ' }
];

console.log("🏁 比賽開始！");

horses.forEach(horse => {
    const url = new URL('./workers/race.js', import.meta.url);
    const worker = new Worker(url, {
        workerData: { name: horse.name, raceLength, sharedBuffer }
    });

    worker.on('message', (message: { name: any; distance: any; }) => {
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
    });

    worker.on('error', (err: { message: any; }) => {
        console.error(`❌ Worker error: ${err.message}`);
    });

    worker.on('exit', (code: number) => {
        if (code !== 0) {
            console.error(`❌ Worker stopped with exit code ${code}`);
        }
    });
});