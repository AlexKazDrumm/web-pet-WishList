import { Router } from 'express';
import { asyncHandler } from '../../lib/async-handler';
import { HttpError } from '../../lib/http-error';
import { parseOrThrow } from '../../lib/validate';
import { requireAuth } from '../../middleware/auth';
import { gameMedia } from '../upload/upload.middleware';
import { storeUpload } from '../upload/upload.service';
import * as repo from './catalog.repo';
import { createGameSchema, createGroupSchema, groupsQuerySchema } from './catalog.schemas';

export const catalogRouter = Router();

catalogRouter.get(
  '/sections',
  asyncHandler(async (_req, res) => {
    res.json(await repo.listSections());
  }),
);

catalogRouter.get(
  '/wish-types',
  asyncHandler(async (_req, res) => {
    res.json(await repo.listWishTypes());
  }),
);

catalogRouter.get(
  '/groups',
  asyncHandler(async (req, res) => {
    const { section } = parseOrThrow(groupsQuerySchema, req.query);
    res.json(await repo.listGroups(section));
  }),
);

catalogRouter.get(
  '/games',
  asyncHandler(async (_req, res) => {
    res.json(await repo.listGames());
  }),
);

catalogRouter.post(
  '/groups',
  requireAuth,
  asyncHandler(async (req, res) => {
    const input = parseOrThrow(createGroupSchema, req.body);
    const sectionId = await repo.sectionIdByName(input.section);
    if (sectionId === null) throw HttpError.badRequest('Unknown section');
    const group = await repo.insertGroup({
      title: input.title,
      description: input.description || null,
      wishTypeId: input.wishTypeId ?? null,
      sectionId,
    });
    res.status(201).json(group);
  }),
);

catalogRouter.post(
  '/games',
  requireAuth,
  gameMedia,
  asyncHandler(async (req, res) => {
    const input = parseOrThrow(createGameSchema, req.body);
    const files = (req.files ?? {}) as Record<string, Express.Multer.File[]>;

    const cover = files.coverImage?.[0];
    const instruction = files.instruction?.[0];
    const coverId = cover ? (await storeUpload(cover)).id : null;
    const instructionId = instruction ? (await storeUpload(instruction)).id : null;

    const game = await repo.insertGame({
      title: input.title,
      groupId: input.groupId ?? null,
      minPlayers: input.minPlayers,
      maxPlayers: input.maxPlayers,
      video: input.video ?? null,
      inCollection: input.inCollection,
      inWishList: input.inWishList,
      coverImage: coverId,
      instruction: instructionId,
    });
    res.status(201).json({ success: true, data: game });
  }),
);
