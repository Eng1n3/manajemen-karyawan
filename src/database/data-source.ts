import { DataSource, DataSourceOptions } from 'typeorm';
import { join } from 'path';
import 'src/common/config/config.env';
import { ConfigService } from '@nestjs/config';

const configService = new ConfigService();

configService.get('DATABASE_PASSWORD')

const database = join(process.cwd(), configService.get('DATABASE_NAME')) + '.sqlite'

export const dataSourceOptions: DataSourceOptions = {
  type: 'sqlite',
  database,
  entities: [join(__dirname, '..', '**', '*.entity.{ts,js}')],
  synchronize: false,
  migrations: [join(__dirname, '..', 'database', 'migrations', '*{.ts,.js}')],
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
