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
        return new Promise(async (resolve, reject) => {
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

            // Returns the name of the operating system
            const osType = os.type();
            // Returns the uptime of the operating system, in seconds
            const upTime = os.uptime();
            // Returns the number of free memory of the system in bytes
            const freeMem = os.freemem();
            // Returns the number of total memory of the system in bytes
            const totalMem = os.totalmem();

            // Calculated memory usage
            const usedMem = totalMem - freeMem;
            const memUsage = ((100 * usedMem) / totalMem).toFixed(1);

            // Note: every core runs on 2 threads
            // Returns an array of objects containing information about the computer's CPUs
            const cpus = os.cpus(); // Returns static data
            const cpuModel = cpus[0].model; // CPU type
            const numCores = cpus.length; // Number of cores
            const cpuUsage = cpus.map((core) => core.times); // CPU speed
            const cpuLoad = await this.getCpuLoad(); // Calculated CPU load
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

    getCpuLoad() {
        return new Promise((resolve, reject) => {
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