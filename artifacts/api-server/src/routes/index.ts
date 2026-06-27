import { Router, type IRouter } from "express";
import healthRouter from "./health";
import postsRouter from "./posts";
import videosRouter from "./videos";
import booksRouter from "./books";
import categoriesRouter from "./categories";
import commentsRouter from "./comments";
import usersRouter from "./users";
import searchRouter from "./search";
import analyticsRouter from "./analytics";
import subscriptionsRouter from "./subscriptions";
import notificationsRouter from "./notifications";
import bookmarksRouter from "./bookmarks";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/posts", postsRouter);
router.use("/videos", videosRouter);
router.use("/books", booksRouter);
router.use("/categories", categoriesRouter);
router.use(commentsRouter); // uses /posts/:postId/comments and /comments/:id
router.use("/users", usersRouter);
router.use("/search", searchRouter);
router.use("/analytics", analyticsRouter);
router.use("/subscriptions", subscriptionsRouter);
router.use("/notifications", notificationsRouter);
router.use("/bookmarks", bookmarksRouter);

export default router;
