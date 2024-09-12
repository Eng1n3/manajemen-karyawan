import { Expose } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';

export class EmployeeImportCsv {
  @Expose({ name: 'nama' })
  name: string;

  @Expose({ name: 'nomor' })
  employeeNumber: number;

  @Expose({ name: 'jabatan' })
  position: string;

  @Expose({ name: 'departmen' })
  department: string;

  @Expose({ name: 'tanggal_masuk' })
  entryDate: Date;

  @Expose({ name: 'foto' })
  photo: string;

  @Expose()
  @IsNotEmpty()
  status: string;
}
