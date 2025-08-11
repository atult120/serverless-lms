// src/handlers/analytics.handler.ts
import { APIGatewayProxyHandler } from 'aws-lambda';
import { AppDataSource } from '../database/database';
import { HowToVideo } from '../entities/HowToVideo';
import { getManager } from 'typeorm';
import { getUserFromEvent } from '../utils/auth';

export const handler: APIGatewayProxyHandler = async (event) => {
  // auth check - only admin/manager
  const user = await getUserFromEvent(event);
  if (!user || !['admin','manager'].includes(user.role)) {
    return { statusCode: 403, body: JSON.stringify({ message: 'Forbidden' }) };
  }

  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(HowToVideo);

  const total = await repo.createQueryBuilder('v')
    .where('v.deleted_at IS NULL')
    .getCount();

  const statusCounts = await repo.createQueryBuilder('v')
    .select('v.status', 'status')
    .addSelect('COUNT(*)', 'count')
    .where('v.deleted_at IS NULL')
    .groupBy('v.status')
    .getRawMany();

  const passwordProtectedCount = await repo.createQueryBuilder('v')
    .where('v.deleted_at IS NULL AND v.is_protected = 1')
    .getCount();

  const top5 = await repo.createQueryBuilder('v')
    .where('v.deleted_at IS NULL')
    .orderBy('v.created_at', 'DESC')
    .limit(5)
    .select(['v.id','v.uuid','v.title','v.created_at','v.views_count'])
    .getRawMany();

  await AppDataSource.destroy();

  const countByStatus: Record<string, number> = {};
  statusCounts.forEach(row => countByStatus[row.status] = parseInt(row.count, 10));

  return {
    statusCode: 200,
    body: JSON.stringify({
      total_videos: total,
      count_by_status: countByStatus,
      password_protected_count: passwordProtectedCount,
      top_5_recent_videos: top5
    })
  };
};
