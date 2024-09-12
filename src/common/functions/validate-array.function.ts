import { validate } from 'class-validator';

export const validateArray = async (row: any[]) => {
  row.forEach(async (data) => {
    try {
      await validate(data);
    } catch (error) {
      throw new Error(
        error.map((err) => Object.values(err.constraints).join(', ')),
      );
    }
  });
};
