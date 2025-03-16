import { ETLService } from './etlService';

const etlService = new ETLService();

etlService.start().catch(error => {
    console.error('ETL failed:', error);
    process.exit(1);
});