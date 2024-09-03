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

    // Method to ensure the client is fully initialized before proceeding
    async ensureInitialized() {
        return new Promise((resolve, reject) => {
            const checkInitialization = () => {
                if (this.client && this.queryClient && this.writeClient && this.deleteAPI) {
                    resolve();
                } else {
                    reject(new Error('InfluxDB client is not fully initialized.'));
                }
            };

            // Immediately check if already initialized
            checkInitialization();
        });
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
