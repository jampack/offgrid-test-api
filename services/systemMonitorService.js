import os from 'os';
import si from 'systeminformation';

class SystemMonitorService {
    constructor() {
        this.cpu = os.cpus();
        this.memory = os.totalmem();
        this.hostname = os.hostname();
    }

    getSystemInfo() {
        return {
            cpu: this.cpu,
            memory: this.memory,
            hostname: this.hostname
        }
    }

    performanceData() {
        return new Promise(async (resolve) => {
            let kbToGb = 1024 * 1024 * 1024; // 1024^3 kilobytes = 1 Gigabyte

            // Returns file system stats
            let fsTotal = 0;
            let fsUsed = 0;
            let fsUsage = 0;

            await si.fsSize().then((data) => {
                data.forEach((disk) => {
                    fsTotal += disk.size / kbToGb;
                    fsUsed += disk.used / kbToGb;
                });

                fsUsage = +((100 * fsUsed) / fsTotal).toFixed(1);
                fsTotal = +fsTotal.toFixed(0);
                fsUsed = +fsUsed.toFixed(0);
            });

            // Returns battery stats
            let battery;

            await si.battery().then((data) => {
                battery = {
                    hasbattery: data.hasbattery,
                    ischarging: data.ischarging,
                    voltage: data.voltage,
                    percent: data.percent,
                };
            });

            const osType = os.type();
            const upTime = os.uptime();
            const freeMem = os.freemem();
            const totalMem = os.totalmem();
            const usedMem = totalMem - freeMem;
            const memUsage = ((100 * usedMem) / totalMem).toFixed(1);

            // Note: every core runs on 2 threads
            // Returns an array of objects containing information about the computer's CPUs
            const cpus = os.cpus();
            const cpuModel = cpus[0].model;
            const numCores = cpus.length;
            const cpuUsage = cpus.map((core) => core.times);
            const cpuLoad = await this.getCpuLoad();
            const isActive = true; // Machine connection status

            resolve({
                freeMem,
                totalMem,
                usedMem,
                memUsage,
                osType,
                upTime,
                cpuModel,
                numCores,
                cpuUsage,
                cpuLoad,
                fsTotal,
                fsUsed,
                fsUsage,
                isActive,
                battery,
            });
        });
    }

    // CPU load
    // {cpus} Returns an array of objects containing information about each logical CPU core
    // Get the CPU average
    cpuAverage() {
        const cpus = os.cpus(); // Called on every check to refresh CPU data
        // The amount of time the computer has spent in each mode since last reboot
        let idleMs = 0; // The aggregate total of all cores idle in milliseconds
        let totalMs = 0;
        // loop through each core
        cpus.forEach((aCore) => {
            // Loop through each property of the current core
            for (const type in aCore.times) {
                totalMs += aCore.times[type];
            }
            idleMs += aCore.times.idle;
        });
        return {
            idle: idleMs / cpus.length,
            total: totalMs / cpus.length,
        };
    }

    // Get the CPU load
    getCpuLoad() {
        return new Promise((resolve) => {
            const start = this.cpuAverage(); // Fetch current CPU load
            // Get updated CPU load every 100ms
            setTimeout(() => {
                const end = this.cpuAverage();
                const idleDifference = end.idle - start.idle;
                const totalDifference = end.total - start.total;
                // Calculate the % of used CPU
                const percentageCpu = 100 - Math.floor((100 * idleDifference) / totalDifference);
                resolve(percentageCpu);
            }, 1000);
        });
    }

}

export default SystemMonitorService;