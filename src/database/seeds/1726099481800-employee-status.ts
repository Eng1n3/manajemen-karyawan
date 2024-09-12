import { DataSource } from 'typeorm';
import { Seeder } from '@jorgebodega/typeorm-seeding';
import { SeederEntity } from 'src/seeder/entities/seeder.entity';
import { EmployeeStatus } from 'src/employee-status/entities/employee-status.entity';

export default class EmployeeStatus1726099481800 extends Seeder {
  public async run(datasource: DataSource): Promise<void> {
    const dataSeeder = await datasource
      .getRepository(SeederEntity)
      .find({ where: { name: EmployeeStatus1726099481800.name } });
    if (!dataSeeder.length) {
      const userRole: EmployeeStatus[] = datasource
        .getRepository(EmployeeStatus)
        .create([
          {
            name: 'kontrak',
            description: 'status kontrak',
          },
          {
            name: 'tetap',
            description: 'status tetap',
          },
          {
            name: 'probation',
            description: 'status probation',
          },
        ]);
      const value = datasource
        .createEntityManager()
        .getRepository(EmployeeStatus)
        .create(userRole);
      await datasource.createEntityManager().save<EmployeeStatus>(value);
      await datasource.getRepository(SeederEntity).save({
        name: EmployeeStatus1726099481800.name,
        timestamp: 1726099481800,
      });
    }
  }
}
