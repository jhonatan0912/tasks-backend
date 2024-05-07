import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

export const handleDBExceptions = (error: any) => {
  if (error instanceof BadRequestException) {
    throw error;
  } else if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
    throw new BadRequestException(
      'Duplicate entry, please provide unique values',
    );
  } else if (error.code === 'ER_NO_REFERENCED_ROW_2' || error.errno === 1452) {
    throw new BadRequestException(
      'Related record not found, please provide valid data',
    );
  } else if (
    error.code === 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD' ||
    error.errno === 1366
  ) {
    throw new BadRequestException(
      'Incorrect value for field, please provide valid data',
    );
  } else {
    throw new InternalServerErrorException(
      'Something went wrong, please check server logs',
    );
  }
};
