const dbHost = process.env.INFLUX_URL || 'http://localhost:8086';
const dbToken = process.env.INFLUX_TOKEN || 'aL90HpXAfRkEBPPwjRO1CBlG-niYc_Nnilx2bFMn38p5XP2Cd1C73jSoAv0vinfg8I3azzEu-uzBl-i-v4TksQ==';
const dbOrg = process.env.INFLUX_ORG || 'offgrid';
const dbBucket = process.env.INFLUX_BUCKET || 'system_usage';

const constants = {
    dbHost,
    dbToken,
    dbOrg,
    dbBucket
}

export default constants;