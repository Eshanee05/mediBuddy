import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterByUploader'
})
export class FilterByUploaderPipe implements PipeTransform {
  transform(files: any[], uploader: string): any[] {
    if (!files) return [];
    return files.filter(f => f.uploadedBy === uploader);
  }
}
