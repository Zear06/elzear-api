import app from './app';
import { arango } from '../config.dev';
import { init } from './arango';

init(arango);
app.listen(3001);
