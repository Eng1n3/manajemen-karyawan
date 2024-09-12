import * as dotenv from 'dotenv';
import { join } from 'path';

const env: string | undefined = process.env.NODE_ENV;
const filename: string = env ? `.${env}.env` : '.env';
const pathEnv = join(process.cwd(), filename);

dotenv.config({ path: pathEnv });

export default dotenv;
