import { APIGatewayProxyHandler } from 'aws-lambda';
import { plainToInstance } from 'class-transformer';
import { AppDataSource } from '../database/database';
import { HowToVideo } from '../entities/HowToVideo';
import { CreateHowToVideoDto } from '../dtos/CreateHowToVideoDto';
import { getUserFromEvent } from '../utils/auth';
import { validateDto } from '../utils/validation';
import { hashPassword } from '../utils/password';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {    
    const user = await getUserFromEvent(event);
    if (!user) {
      return { statusCode: 403, body: JSON.stringify({ message: 'Forbidden' }) };
    }

    // Parse + validate payload
    const payload = JSON.parse(event.body || '{}');
    const dto = plainToInstance(CreateHowToVideoDto, payload);

    await validateDto(dto);

    // Initialize database connection
    const repo = AppDataSource.getRepository(HowToVideo);

    // Handle password hashing if video is protected
    let hashedPassword = null;
    if (dto.is_protected && dto.password) {
      hashedPassword = await hashPassword(dto.password);
    }

    // Create single video entity
    const videoData: Partial<HowToVideo> = {
      title: dto.title,
      createdBy: user.id!,
      updatedBy: user.id!,
      provider: dto.provider || 's3',
      videoUrl: dto.video_url,
      status: (dto.status as 'enabled' | 'disabled' | 'unpublished') || 'unpublished',
      isProtected: dto.is_protected || false,
    };

    if (dto.description) videoData.description = dto.description;
    if (dto.thumbnail_url) videoData.thumbnailUrl = dto.thumbnail_url;
    if (dto.duration_seconds) videoData.durationSeconds = dto.duration_seconds;
    if (hashedPassword) videoData.passwordHash = hashedPassword;
    if (dto.tags && dto.tags.length > 0) videoData.tags = dto.tags;
    if (dto.metadata) videoData.metadata = dto.metadata;

    const videoToSave = repo.create(videoData);

    // Save the video
    const created = await repo.save(videoToSave);

    // Close DB connection
    await AppDataSource.destroy();

    return {
      statusCode: 201,
      body: JSON.stringify({ 
        message: 'Video created successfully',
        data: created 
      })
    };
  } catch (err: any) {
    // Ensure connection is closed on error
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }

    if (err.validationErrors) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: err.message,
          errors: err.validationErrors
        }),
      };
    }
    
    console.error('Error creating video:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal Server Error',
        error: err.message || err
      })
    };
  }
};