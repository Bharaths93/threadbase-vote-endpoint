import { Router } from "express";
import { prisma, Prisma } from "../lib/prisma.js";

export const postsRouter = Router();

// GET /posts - helper to inspect all posts and their scores
postsRouter.get("/", async (req, res, next) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        votes: true,
      },
    });
    res.json(posts);
  } catch (err) {
    next(err);
  }
});

// GET /posts/:id - helper to inspect a single post
postsRouter.get("/:id", async (req, res, next) => {
  try {
    const postId = parseInt(req.params.id, 10);
    if (isNaN(postId)) {
      return res.status(400).json({ error: "Invalid post ID" });
    }

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        votes: true,
      },
    });

    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    res.json(post);
  } catch (err) {
    next(err);
  }
});

// POST /posts/:id/vote - 5-step skeleton
postsRouter.post("/:id/vote", async (req, res, next) => {
  try {
    // 1. Parse postId with parseInt(req.params.id) and read userId from req.user.id
    const postId = parseInt(req.params.id, 10);
    const userId = (req as any).user?.id;

    // 2. Validate — if isNaN(postId), return 400 before touching the database
    if (isNaN(postId)) {
      return res.status(400).json({ error: "Invalid post ID" });
    }

    // 3. Query — inside one prisma.$transaction([...]), update post score atomically and create Vote row
    const [updatedPost, vote] = await prisma.$transaction([
      prisma.post.update({
        where: { id: postId },
        data: {
          score: {
            increment: 1,
          },
        },
      }),
      prisma.vote.create({
        data: {
          userId,
          postId,
        },
      }),
    ]);

    // 4. Respond — return 201 with the post's new score on success
    return res.status(201).json({ score: updatedPost.score });
  } catch (err: any) {
    // 5. Handle errors in the catch block: map P2002 -> 409 and P2025 -> 404; pass anything else to next(err)
    if (err instanceof Prisma.PrismaClientKnownRequestError || err?.code) {
      if (err.code === "P2002") {
        return res.status(409).json({ error: "Already voted" });
      }
      if (err.code === "P2025" || err.code === "P2003") {
        return res.status(404).json({ error: "Post not found" });
      }
    }
    return next(err);
  }
});
