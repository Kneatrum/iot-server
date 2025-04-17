const { InfluxDB } = require('@influxdata/influxdb-client');
const { DeleteAPI } = require('@influxdata/influxdb-client-apis');
const { retrieveInfluxDBSecrets } = require('../../secrets/aws_secrets.js');

const env = process.env.NODE_ENV || 'development';
const envFile = env === 'production' ? '../.env' : `../.env.${env}`;
require('dotenv').config({path: envFile});

const influxBaseURL =  process.env.INFLUXDB_HOST || 'http://localhost:8086';

class InfluxClient {
    constructor() {
        this.client = null;
        this.queryClient = null;
        this.writeClient = null;
        this.deleteAPI = null;
        this.org = null;
        this.bucket = null;
        this.token = null;
        this.url = null;
        this.secretsLoaded = false;
    }

    async loadSecrets() {

        if(!this.url){
            this.url = influxBaseURL;
        }
        
        if (!this.secretsLoaded) {
            // Load secrets from AWS Secrets Manager
            try {
                const secrets = await retrieveInfluxDBSecrets();
                if (secrets) {
                    this.token = secrets.apiKey;
                    this.org = secrets.organisation;
                    this.bucket = secrets.bucket;

                    // Generate influxDB clients
                    this.client = new InfluxDB({ url: this.url, token: this.token });
                    this.deleteAPI = new DeleteAPI(this.client);
                    this.queryClient = this.client.getQueryApi(this.org);
                    this.writeClient = this.client.getWriteApi(this.org, this.bucket, 'ns');

                    this.secretsLoaded = true;
                } else {
                    throw new Error('Failed to load InfluxDB secrets');
                }
            } catch (error) {
                console.error('Error loading InfluxDB secrets:', error);
                throw error;
            }
        }
    }

    async ensureInitialized(timeout = 60000, interval = 100) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();

            const checkInitialization = () => {
                if (this.client && 
                    this.queryClient && 
                    this.writeClient && 
                    this.deleteAPI &&
                    this.bucket && 
                    this.org &&
                    this.token
                ) {
                    
                    console.log("InfluxDB client is now fully initialized'")
                    resolve(); // Resolve if all components are initialized
                } else if (Date.now() - startTime >= timeout) {
                    reject(new Error('Timeout: InfluxDB client is not fully initialized.')); // Reject if the timeout is reached
                } else {
                    setTimeout(checkInitialization, interval); // Continue checking after the specified interval
                }
            };

            // Start checking initialization immediately
            this.loadSecrets().then(checkInitialization).catch(reject);
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
