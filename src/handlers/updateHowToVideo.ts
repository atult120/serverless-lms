import { APIGatewayProxyHandler } from 'aws-lambda';
import { plainToInstance } from 'class-transformer';
import { AppDataSource } from '../database/database';
import { HowToVideo } from '../entities/HowToVideo';
import { getUserFromEvent } from '../utils/auth';
import { validateDto } from '../utils/validation';
import { hashPassword } from '../utils/password';
import { UpdateHowToVideoDto } from '../dtos/UpdateHowToVideoDto';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const user = await getUserFromEvent(event);
    if (!user) {
      return { statusCode: 401, body: JSON.stringify({ message: 'Unauthorized' }) };
    }

    const idOrUuid = event.pathParameters?.id;
    if (!idOrUuid) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Video ID is required' }) };
    }

    // Parse and validate payload
    const payload = JSON.parse(event.body || '{}');
    const dto = plainToInstance(UpdateHowToVideoDto, payload);
    
    await validateDto(dto);

    const repo = AppDataSource.getRepository(HowToVideo);

    const video = await repo.findOne({ 
      where: [
        { id: Number(idOrUuid) }, 
        { uuid: idOrUuid }
      ] 
    });
    
    if (!video) {
      await AppDataSource.destroy();
      return { statusCode: 404, body: JSON.stringify({ message: 'Video not found' }) };
    }

    // Apply updates
    if (dto.title !== undefined) video.title = dto.title;
    if (dto.description !== undefined) video.description = dto.description;
    if (dto.status !== undefined) video.status = dto.status as 'enabled' | 'disabled' | 'unpublished';
    if (dto.tags !== undefined) video.tags = dto.tags;
    if (dto.thumbnail_url !== undefined) video.thumbnailUrl = dto.thumbnail_url;
    
    // Handle protected video and password
    if (dto.is_protected !== undefined) {
      video.isProtected = dto.is_protected;
      
      if (dto.is_protected && dto.password) {
        video.passwordHash = await hashPassword(dto.password);
      } else if (!dto.is_protected) {
        video.passwordHash = null;
      }
    }

    video.updatedBy = user.id!

    const updatedVideo = await repo.save(video);
    await AppDataSource.destroy();

    return { 
      statusCode: 200, 
      body: JSON.stringify({ 
        message: 'Video updated successfully',
        data: updatedVideo 
      }) 
    };
  } catch (err: any) {
    // Handle validation errors
    if (err.validationErrors) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: err.message,
          errors: err.validationErrors
        }),
      };
    }

    console.error('Error updating video:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal Server Error',
        error: err.message || err
      })
    };
  }
};
