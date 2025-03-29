import { WorkerPool } from './workerPool';

const raceLength = 100; // 比賽距離
const sharedBuffer = new SharedArrayBuffer(4); // 共享變數
const raceOverFlag = new Int32Array(sharedBuffer);
raceOverFlag[0] = 0; // 初始化比賽結束標誌

const players = [
    { name: 'Ａ' },
    { name: 'Ｂ' },
    { name: 'Ｃ' }
];

const workersPool = new WorkerPool((availableWorkers: any) => {
    console.log(`👷 Available Workers: ${availableWorkers}`);
});

workersPool.setTotalWorkersChangeCallback((totalWorkers: any) => {
    console.log(`Total workers: ${totalWorkers}`);
});

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
sleep(1000);
console.log("🏁 比賽開始！");

function handleMessage(worker: Worker, message: any) {
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
}
players.forEach(horse => {
    workersPool.runTask({ name: horse.name, raceLength, sharedBuffer }, handleMessage);
});
