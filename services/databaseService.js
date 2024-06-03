import {InfluxDB, Point} from '@influxdata/influxdb-client'
import constants from "../constants.js";

export class DatabaseService {
    constructor() {
        this.influxDB = new InfluxDB({url: constants.dbHost, token: constants.dbToken})
    }

    // Write data to InfluxDB
    async writeData(data) {
        const writeApi = this.influxDB.getWriteApi(constants.dbOrg, constants.dbBucket)
        const point = new Point('system_data')
            .floatField('cpu', data.cpuLoad)
            .floatField('ram', data.memUsage)
            .timestamp(data.timestamp)
        writeApi.writePoint(point)
        await writeApi.close()
    }

    // Read data from InfluxDB
    async readData() {
        const queryApi = this.influxDB.getQueryApi(constants.dbOrg)
        const query = `from(bucket: "${constants.dbBucket}") |> range(start: -1h)`
        const result = []
        return new Promise((resolve, reject) => {
            queryApi.queryRows(query, {
                next(row, tableMeta) {
                    const obj = tableMeta.toObject(row)
                    result.push(obj)
                },
                error(error) {
                    reject(error)
                },
                complete() {
                    resolve(result)
                }
            })
        })
    }

    // Read last n seconds of data from InfluxDB
    async readLastDataPoints(numberOfSeconds) {
        const queryApi = this.influxDB.getQueryApi(constants.dbOrg)
        const query = `from(bucket: "${constants.dbBucket}") |> range(start: -${numberOfSeconds}s)`
        const result = []
        return new Promise((resolve, reject) => {
            queryApi.queryRows(query, {
                next(row, tableMeta) {
                    const obj = tableMeta.toObject(row)
                    result.push(obj)
                },
                error(error) {
                    console.error(error)
                    reject(error)
                },
                complete() {
                    resolve(result)
                }
            })
        });
    }
}
