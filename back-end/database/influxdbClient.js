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
            console.log("######Done initializing")
        }
    }

    async ensureInitialized(timeout = 60000, interval = 100) {
        const startTime = Date.now();

        const checkInitialization = () => {
            if (this.isFullyInitialized()) {
                return true;
            }
            if (Date.now() - startTime >= timeout) {
                throw new Error('Timeout: InfluxDB client is not fully initialized.');
            }
            return false;
        };

        while (!checkInitialization()) {
            await new Promise(resolve => setTimeout(resolve, interval));
        }
    }

    isFullyInitialized() {
        return !!(this.client && this.queryClient && this.writeClient && this.deleteAPI);
    }

    async getClient() {
        await this.ensureInitialized(); // Wait for the client to be initialized
        return {
            client: this.client,
            deleteAPI: this.deleteAPI,
            queryClient: this.queryClient,
            writeClient: this.writeClient,
            org: this.org,
            bucket: this.bucket,
            token: this.token,
        };
    }
}

const influxClient = new InfluxClient();
module.exports = influxClient;
