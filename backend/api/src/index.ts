import { Api } from './api';
import dotenv from 'dotenv';

dotenv.config();

new Api().start(parseInt(process.env.PORT || '3000'));