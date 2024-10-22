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
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            console.time("WaitTimer");

            const checkInitialization = () => {
                if (this.client && 
                    this.queryClient && 
                    this.writeClient && 
                    this.deleteAPI &&
                    this.bucket && 
                    this.org &&
                    this.token
                ) {
                    console.timeEnd("waitTimer");
                    console.log("Yaaaaaaaaaay InfluxDB client is now fully initialized'")
                    console.log(this.bucket)
                    console.log(this.bucket)
                    console.log(this.token)
                    resolve(); // Resolve if all components are initialized
                } else if (Date.now() - startTime >= timeout) {
                    reject(new Error('Timeout: InfluxDB client is not fully initialized.')); // Reject if the timeout is reached
                } else {
                    setTimeout(checkInitialization, interval); // Continue checking after the specified interval
                }
            };

            // Start checking initialization immediately
            checkInitialization();
        });
    }


    async getClient() {
        try {
            await this.ensureInitialized();
            return {
                client: this.client,
                deleteAPI: this.deleteAPI,
                queryClient: this.queryClient,
                writeClient: this.writeClient,
                org: this.org,
                bucket: this.bucket,
                token: this.token,
            };
        } catch (error) {
            console.error("Failed to initialize InfluxDB client:", error);
            throw error; 
        }
    }
}

const influxClient = new InfluxClient();
module.exports = influxClient;
