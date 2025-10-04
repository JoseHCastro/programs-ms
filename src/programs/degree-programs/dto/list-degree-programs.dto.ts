import { PaginationDto } from '../../../common/dto/pagination.dto';
import { IsIn, IsOptional } from 'class-validator';

export class ListDegreeProgramsDto extends PaginationDto {
  @IsOptional()
  @IsIn(['Active', 'Inactive'])
  status?: string;
}
