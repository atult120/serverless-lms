import { APIGatewayProxyHandler } from 'aws-lambda';
import { AppDataSource } from '../database/database';
import { HowToVideo } from '../entities/HowToVideo';
import { getUserFromEvent } from '../utils/auth';

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const user = await getUserFromEvent(event);
    if (!user) {
      return { statusCode: 403, body: JSON.stringify({ message: 'Forbidden' }) };
    }
    const qs = event.queryStringParameters || {};
    const page = Math.max(1, parseInt(qs.page || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(qs.limit || '20')));
    const offset = (page - 1) * limit;

    const repo = AppDataSource.getRepository(HowToVideo);

  const qb = repo.createQueryBuilder('v')
    .where('v.deleted_at IS NULL');

  if (qs.status) qb.andWhere('v.status = :status', { status: qs.status });
  if (qs.uploader) qb.andWhere('v.uploader_user_id = :uploader', { uploader: qs.uploader });
  if (qs.search) qb.andWhere('(v.title LIKE :s OR v.description LIKE :s)', { s: `%${qs.search}%` });
  if (qs.tags) {
    const tags = qs.tags.split(',');
    // this assumes tags JSON contains simple array of strings; use JSON_CONTAINS in MySQL
    tags.forEach((t, idx) => qb.andWhere(`JSON_CONTAINS(v.tags, :tag${idx})`, { [`tag${idx}`]: JSON.stringify(t) }));
  }

  const sort = (qs.sort || 'created_at:desc').split(':');
  qb.orderBy(`v.${sort[0]}`, (sort[1] || 'desc').toUpperCase() as "ASC" | "DESC");
  qb.skip(offset).take(limit);

    const [data, total] = await qb.getManyAndCount();
    await AppDataSource.destroy();

    return {
      statusCode: 200,
      body: JSON.stringify({
        meta: { page, limit, total },
        data
      })
    };
  } catch (error: any) {
    console.error('Error fetching videos:', error);
    
    // Ensure connection is closed on error
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
    
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal Server Error',
        error: error.message || error
      })
    };
  }
};
