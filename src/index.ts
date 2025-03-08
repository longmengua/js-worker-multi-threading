import { Worker } from 'worker_threads';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const raceLength = 100; // 比賽距離
const sharedBuffer = new SharedArrayBuffer(4); // 共享變數
const raceOverFlag = new Int32Array(sharedBuffer);
raceOverFlag[0] = 0; // 初始化比賽結束標誌

const horses = [
    { name: '黑風', file: resolve(__dirname, '../dist/workers/hourseRace.js') },
    { name: '風暴', file: resolve(__dirname, '../dist/workers/hourseRace.js') },
    // 可以添加更多馬匹
];

console.log('🏇 賽馬比賽開始！');

horses.forEach(horse => {
    const worker = new Worker(horse.file, {
        workerData: { name: horse.name, raceLength, sharedBuffer }
    });

    worker.on('message', (message) => {
        if (message.winner) {
            console.log(`🏆 ${message.winner} 贏得比賽！`);
        } else {
            console.log(`${message.name} 跑了 ${message.distance} 公尺`);
        }
    });

    worker.on('exit', (code) => {
        if (code !== 0) {
            console.error(`Worker stopped with exit code ${code}`);
        }
    });
});