import SystemMonitorService from '../services/systemMonitorService.js';

class SystemMonitorController {
    constructor() {
        this.systemMonitorService = new SystemMonitorService();
    }

    async getSystemData() {
        try {
            return this.systemMonitorService.performanceData();
        } catch (error) {
            return {error: error.message};
        }
    }
}

export default SystemMonitorController;