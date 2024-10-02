import { FileValidator } from '@nestjs/common';
import { parse } from 'file-type-mime';

export class CustomUploadFileTypeValidator extends FileValidator {
  constructor(protected readonly validExtensions: string[]) {
    super(validExtensions);
  }

  async isValid(file?: Express.Multer.File): Promise<boolean> {
    const fileTypeProps = parse(file.buffer);
    if (!fileTypeProps) return false;
    if (file.mimetype !== fileTypeProps.mime) return false;
    const extension = fileTypeProps.mime.split('/')[1];
    return this.validExtensions.includes(extension);
  }

  buildErrorMessage(file: Express.Multer.File): string {
    return `${
      file.mimetype.split('/')[1]
    } is not valid. Only files allowed: ${this.validExtensions.join(', ')}`;
  }
}
