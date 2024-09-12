import { join, resolve } from 'path';
import { ConfigOptions } from 'src/config/interfaces/config-options.interface';

export function getEnvPath(dest: ConfigOptions): string {
  const env: string | undefined = process.env.NODE_ENV;
  const filename: string = env ? `.${env}.env` : '.env';
  // return resolve(__dirname, '../../../', dest.folder, filename);
  return join(process.cwd(), dest.folder, filename)
}
