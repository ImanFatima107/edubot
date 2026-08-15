import { ApiProperty } from '@nestjs/swagger';

export class CreateRoadmapDto {
  @ApiProperty({ example: 'Computer Science', description: "The student's field of study" })
  field: string;

  @ApiProperty({ example: 'Next.js', description: 'The trendy technology to explain and create a plan for' })
  tech: string;

  @ApiProperty({ example: 'student@example.com', description: 'Email address to send the roadmap to' })
  email: string;
}
