import SystemMonitorService from '../services/systemMonitorService.js';
import {DatabaseService} from "../services/DatabaseService.js";

class SystemMonitorController {
    constructor() {
        this.systemMonitorService = new SystemMonitorService();
        this.databaseService = new DatabaseService();
    }

    async getSystemData() {
        try {
            // console.log(systemMonitor);
            // const data = await this.systemMonitorService.performanceData();
            // await this.databaseService.writeData(data);
            // const readData = await this.databaseService.readData();
            // console.log(readData);
            return this.systemMonitorService.performanceData();
        } catch (error) {
            return {error: error.message};
        }
    }
}

export default SystemMonitorController;