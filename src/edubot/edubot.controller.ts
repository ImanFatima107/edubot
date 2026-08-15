import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { EdubotService } from './edubot.service';
import { CreateRoadmapDto } from './dto/create-roadmap.dto';
import * as Sentry from '@sentry/nestjs';

@ApiTags('edubot')
@Controller('edubot')
export class EdubotController {
  constructor(private readonly edubotService: EdubotService) {}

  @Post('roadmap')
  @ApiOperation({ summary: 'Generate a tech learning roadmap and email it to the student' })
  @ApiBody({ type: CreateRoadmapDto })
  @ApiResponse({ status: 201, description: 'Roadmap generated and emailed successfully.', type: String })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async generateAndEmailRoadmap(@Body() createRoadmapDto: CreateRoadmapDto) {
    try {
      const { field, tech, email } = createRoadmapDto;

      // 1. Generate roadmap using Gemini
      const roadmap = await this.edubotService.generateRoadmap(field, tech);

      // 2. Email roadmap via Resend
      const subject = `Your 1-Week ${tech} Learning Roadmap for ${field}`;
      await this.edubotService.emailRoadmap(email, subject, roadmap);

      return {
        message: 'Roadmap generated and emailed successfully!',
        roadmap,
      };
    } catch (error) {
      // Capture error in Sentry
      Sentry.captureException(error);
      throw new HttpException(
        error.message || 'Failed to generate and email roadmap',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
