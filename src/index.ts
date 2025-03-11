import { workerPool } from './workerPool';

const raceLength = 100; // 比賽距離
const sharedBuffer = new SharedArrayBuffer(4); // 共享變數
const raceOverFlag = new Int32Array(sharedBuffer);
raceOverFlag[0] = 0; // 初始化比賽結束標誌

const players = [
    { name: 'Ａ' },
    { name: 'Ｂ' },
    { name: 'Ｃ' }
];

console.log("🏁 比賽開始！");

players.forEach(horse => {
    workerPool.runTask({ name: horse.name, raceLength, sharedBuffer });
});
