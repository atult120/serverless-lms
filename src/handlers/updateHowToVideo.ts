import { APIGatewayProxyHandler } from 'aws-lambda';
import { AppDataSource } from '../database/database';
import { HowToVideo } from '../entities/HowToVideo';
import { getUserFromEvent } from '../utils/auth';
import * as bcrypt from 'bcryptjs';

export const handler: APIGatewayProxyHandler = async (event) => {
  const user = await getUserFromEvent(event);
  if (!user) return { statusCode: 401, body: JSON.stringify({ message: 'Unauthorized' }) };

  const idOrUuid = event.pathParameters?.id;
  const payload = JSON.parse(event.body || '{}');

  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(HowToVideo);

  const video = await repo.findOne({ where: [{ id: Number(idOrUuid) }, { uuid: idOrUuid }] });
  if (!video) {
    await AppDataSource.destroy();
    return { statusCode: 404, body: JSON.stringify({ message: 'Not found' }) };
  }

  // Authorization: uploader or admin
  if (user.role !== 'admin' && user.id !== video.uploaderUserId) {
    await AppDataSource.destroy();
    return { statusCode: 403, body: JSON.stringify({ message: 'Forbidden' }) };
  }

  // Apply updates
  if (payload.title) video.title = payload.title;
  if (payload.description) video.description = payload.description;
  if (payload.status && ['draft','published','archived'].includes(payload.status)) video.status = payload.status;
  if (typeof payload.is_protected === 'boolean') {
    video.isProtected = payload.is_protected;
    if (payload.is_protected && payload.password) {
      const salt = await bcrypt.genSalt(10);
      video.passwordHash = await bcrypt.hash(payload.password, salt);
    } else if (!payload.is_protected) {
      video.passwordHash = null;
    }
  }
  if (payload.tags) video.tags = payload.tags;
  if (payload.thumbnail_url) video.thumbnailUrl = payload.thumbnail_url;

  await repo.save(video);
  await AppDataSource.destroy();

  return { statusCode: 200, body: JSON.stringify({ data: video }) };
};
