const { InfluxDB } = require('@influxdata/influxdb-client');
const { DeleteAPI } = require('@influxdata/influxdb-client-apis');

class InfluxClient {
    constructor() {
        this.client = null;
        this.queryClient = null;
        this.writeClient = null;
        this.deleteAPI = null;
        this.org = null;
        this.bucket = null;
        this.token = null;
    }

    initialize(url, token, org, bucket) {
        if (!this.client) {
            this.token = token;
            this.org = org;
            this.client = new InfluxDB({ url, token });
            this.deleteAPI = new DeleteAPI(this.client);
            this.queryClient = this.client.getQueryApi(org);
            this.writeClient = this.client.getWriteApi(org, bucket, 'ns');
        }
    }

    getClient() {
        if (!this.client || !this.queryClient || !this.getWriteApi || !this.deleteAPI) {
            throw new Error('InfluxDB client is not initialized.');
        }
        return { client: this.client, deleteAPI: this.deleteAPI, queryClient: this.queryClient, org: this.org, bucket: this.bucket, token: this.token };
    }
}

const influxClient = new InfluxClient();
module.exports = influxClient;
