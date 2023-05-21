/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import express from 'express';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { io, connectedUsers } from '../socket';

const prisma = new PrismaClient();

dotenv.config();

const Friendship = express.Router();

Friendship.post('/', async (req, res) => {
  const { userId, friendId } = req.body;
  try {
    const friendship = await prisma.friendship.create({
      data: {
        user: { connect: { id: userId } },
        friend: { connect: { id: friendId } },
      },
    });

    const sender = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (sender) {
      const offline = !connectedUsers.includes(friendId.id);
      const data = await prisma.notifications.create({
        data: {
          body: `${sender.firstName} is now following you!`,
          type: 'New Friend',
          recipient: friendId,
          createdAt: new Date(), // Update this line to set the userId field
          offline,
          User: {
            connect: {
              id: sender.id,
            },
          },
        },
        include: {
          User: {
            select: {
              id: true,
              firstName: true,
              picture: true,
            },
          },
        },
      });
      if (!offline) {
        io.to(friendId).emit('new-notification', data);
      }
    }
  } catch (error) {
    console.error(error);
  }
});

export default Friendship;
