import { MemoryStoredFile } from 'nestjs-form-data';
import { CreateFile } from '../interfaces/create-file.interface';
import * as dayjs from 'dayjs';
import { generate } from 'randomstring';
import { existsSync, statSync, unlinkSync, writeFileSync } from 'fs';
import { fromFile } from 'file-type';
import * as mime from 'mime-types';
import { createHash } from 'crypto';
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';

const configService = new ConfigService();

export function getSize(filePath: string) {
  const stats = statSync(filePath);
  const fileSizeInBytes = stats.size;
  return fileSizeInBytes;
}

export function getChecksum(
  filePath: string,
  algorithm = 'sha256',
): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash(algorithm);
    const stream = fs.createReadStream(filePath);

    stream.on('data', (data) => {
      hash.update(data);
    });

    stream.on('end', () => {
      const checksum = hash.digest('hex');
      resolve(checksum);
    });

    stream.on('error', (err) => {
      reject(err);
    });
  });
}

export async function getMimetype(filePath: string) {
  const file = await fromFile(filePath);
  return file.mime;
}

function deleteFile(path: string): void {
  if (existsSync(path)) unlinkSync(path);
}

export function createFileFunction(
  saveTo: string,
  originalFilename: string,
  uploadPath?: string,
): CreateFile {
  const uploadPathWithPublic = `uploads/${uploadPath}`;
  const timestamp = dayjs().valueOf();
  const newFileName = `${timestamp}${generate({
    length: 8,
    charset: 'numeric',
  })}`;
  let filename = `${newFileName}.${saveTo}`;
  // convert to ${saveTo}
  if (existsSync(`${uploadPathWithPublic}/${filename}`)) {
    // delete the original file
    if (
      filename != `${newFileName}.${saveTo}` &&
      existsSync(`${uploadPathWithPublic}/${filename}`)
    )
      deleteFile(`${uploadPathWithPublic}/${filename}`);
    filename = `${newFileName}.${saveTo}`;
  }

  // const size = getSize(`${uploadPathWithPublic}/${filename}`);

  return {
    path: `${uploadPathWithPublic}/${filename}`,
    filename,
    originalFilename,
    mime: saveTo,
  };
}
