import dotenv from 'dotenv';
dotenv.config();

const dbHost = process.env.INFLUX_URL || 'http://localhost:8086';
const dbToken = process.env.INFLUX_TOKEN || '';
const dbOrg = process.env.INFLUX_ORG || 'offgrid';
const dbBucket = process.env.INFLUX_BUCKET || 'system_usage';

const constants = {
    dbHost,
    dbToken,
    dbOrg,
    dbBucket
}

export default constants;