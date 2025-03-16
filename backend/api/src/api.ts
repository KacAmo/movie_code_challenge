import cors from 'cors';
import express, { Application } from 'express';
import { Server } from 'http';
import { Routes } from './routes';

export class Api {
    public app: Application;
    private server: Server | null = null;

    constructor() {
        this.app = express();
        this.configureMiddleware();
        this.configureRoutes();
        this.configureShutdown();
    }

    private configureMiddleware(): void {
        if (process.env.NODE_ENV !== 'production') {
            this.app.use(cors());
        }
        this.app.use(express.json());
    }

    private configureRoutes(): void {
        const routes = new Routes();
        this.app.use('/', routes.getRouter());
    }

    private configureShutdown(): void {
        process.on('SIGTERM', () => this.shutdown());
        process.on('SIGINT', () => this.shutdown());
    }

    private async shutdown(): Promise<void> {
        console.log('Gracefully shutting down...');
        
        if (this.server) {
            await new Promise<void>((resolve) => {
                this.server?.close(() => {
                    console.log('Server closed');
                    resolve();
                });
            });
        }

        process.exit(0);
    }

    public start(port: number = 3000): void {
        this.server = this.app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
    }
}