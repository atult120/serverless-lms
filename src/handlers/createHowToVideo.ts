import { APIGatewayProxyHandler } from 'aws-lambda';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { v4 as uuidv4 } from 'uuid';
import { AppDataSource } from '../database/database';
import { HowToVideo } from '../entities/HowToVideo';
import { CreateHowToVideoDto } from '../dtos/CreateHowToVideoDto';
import { getUserFromEvent } from '../utils/auth';
import { DeepPartial } from 'typeorm';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const user = await getUserFromEvent(event);
    if (!user || !['admin', 'instructor'].includes(user.role)) {
      return { statusCode: 403, body: JSON.stringify({ message: 'Forbidden' }) };
    }

    // 2. Parse + validate payload
    const payload = JSON.parse(event.body || '{}');
    console.log('Payload:', payload);
    const dto = plainToInstance(CreateHowToVideoDto, payload);
    console.log('DTO instance:', dto);
    const validationErrors = await validateOrReject(dto, { whitelist: true });
    console.log('Validation errors:', validationErrors);
    

    // 3. DB connection
    await AppDataSource.initialize();

    const repo = AppDataSource.getRepository(HowToVideo);

    // 4. Prepare array of entities
    const videosToSave = dto.videos.map(v =>
      repo.create({
        title: v.title,
        description: v.description,
        uploaderUserId: user.id!,
        provider: v.provider || 's3',
        videoUrl: v.video_url,
        thumbnailUrl: v.thumbnail_url,
        durationSeconds: v.duration_seconds,
        status: v.status || 'draft',
        isProtected: v.is_protected || false,
        tags: v.tags || null,
        metadata: v.metadata || null,
      }) as DeepPartial<HowToVideo>
    );

    // 6. Bulk save
    const created = await repo.save(videosToSave);

    // 7. Close DB connection
    await AppDataSource.destroy();

    return {
      statusCode: 201,
      body: JSON.stringify({ data: created })
    };
  } catch (err: any) {
    console.error('Error creating videos:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal Server Error',
        error: err.message || err
      })
    };
  }
};