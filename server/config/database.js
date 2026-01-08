const mongoose = require("mongoose");

const MAX_RETRIES = 3;
const RETRY_INTERVAL = 5000; // 5 SECONDS

class DatabaseConnection {
  constructor() {
    this.retryCount = 0;
    this.isConnected = false;
    this.connecting = false;

    // configure mongoose setting
    mongoose.set("strictQuery", true);

    mongoose.connection.on("connected", () => {
      console.log("MONGODB CONNECTED SUCCESSFULLY");
      this.isConnected = true;
    });

    mongoose.connection.on("error", () => {``
      console.error("MONGODB CONNECTION ERROR");
      this.isConnected = false;
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MONGODB DISCONNECTED");
      this.handleDisconnection();
    });

    process.on('SIGTERM', this.handleAppTermination.bind(this))
  }

  async connect() {
    try {
      if (!process.env.MONGODB_URI) {
        throw new Error("Mongo db URI is not defined in env variables");
      }
      if (this.isConnected || this.connecting) return;
      this.connecting = true;

      const connectionOptions = {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        family: 4, // use IPv4
      };
      if (process.env.NODE_ENV === "development") {
        mongoose.set("debug", true);
      }

      await mongoose.connect(process.env.MONGODB_URI, connectionOptions);
      this.retryCount = 0;
      this.isConnected = true;
      this.connecting = false;
    } catch (error) {
      console.error(error.message);
      this.connecting = false;
      await this.handleConnectionError();
    }
  }

  async handleConnectionError() {
    if (this.retryCount < MAX_RETRIES) {
      this.retryCount++;
      console.log(
        `Retrying connection... Attempt ${this.retryCount} of ${MAX_RETRIES}`
      );
      await new Promise((resolve) => setTimeout(resolve, RETRY_INTERVAL));
      await this.connect();
    } else {
      console.error(
        `Failed to connect to MONGODB after ${MAX_RETRIES} attempts`
      );
      process.exit(1);
    }
  }

  async handleDisconnection() {
    if (!this.isConnected && !this.connecting) {
      console.log("Attempting to reconnect to mongodb...");
      await this.handleConnectionError();
    }
  }

  async handleAppTermination() {
    try {
      await mongoose.connection.close();
      console.log("MONGODB connection closed through termination");
      process.exit(0);
    } catch (error) {
      console.error("Error during database disconnection", error);
      process.exit(1);
    }
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host || null,
      name: mongoose.connection.name || null,
    };
  }
}

const dbConnection = new DatabaseConnection()

const connectingToDatabase = dbConnection.connect.bind(dbConnection)
const getDBStatus = dbConnection.getConnectionStatus.bind(dbConnection)
module.exports = {getDBStatus, connectingToDatabase}