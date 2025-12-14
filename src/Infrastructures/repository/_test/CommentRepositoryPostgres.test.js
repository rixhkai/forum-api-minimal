const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const pool = require("../../database/postgres/pool");
const CommentRepositoryPostgres = require("../CommentRepositoryPostgres");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../../Commons/exceptions/AuthorizationError");

describe("CommentRepositoryPostgres", () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("createCommentThread", () => {
    it("should throw NotFoundError when thread not found", async () => {
      // Arrange
      const users = await UsersTableTestHelper.addUser({
        username: "dicoding",
      });
      const fakeIdGenerator = () => "123"; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action & Assert
      return expect(
        commentRepositoryPostgres.createCommentThread({
          credentialsId: users.id,
          threadId: "thread-123",
          content: "new comment thread",
        })
      ).rejects.toThrowError(NotFoundError);
    });

    it("should persist create comment thread and return created comment thread correctly", async () => {
      // Arrange
      const users = await UsersTableTestHelper.addUser({
        username: "dicoding",
      });
      // create thread
      await ThreadsTableTestHelper.addThread({
        owner: users.id,
        id: "thread-123",
        title: "new thread",
        body: "new body thread",
      });
      const fakeIdGenerator = () => "123"; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      await commentRepositoryPostgres.createCommentThread({
        credentialsId: users.id,
        threadId: "thread-123",
        content: "new comment thread",
      });

      // Assert
      const comment = await CommentsTableTestHelper.findCommentThreadById(
        "thread-123",
        "tc-123"
      );
      expect(comment).toHaveLength(1);
    });

    it("should return created comment thread correctly", async () => {
      // Arrange
      const users = await UsersTableTestHelper.addUser({
        username: "dicoding",
      });
      // create thread
      await ThreadsTableTestHelper.addThread({
        owner: users.id,
        id: "thread-123",
        title: "new thread",
        body: "new body thread",
      });
      const comment = {
        credentialsId: users.id,
        threadId: "thread-123",
        content: "new comment thread",
      };
      const fakeIdGenerator = () => "123"; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      const createdComment =
        await commentRepositoryPostgres.createCommentThread(comment);

      // Assert
      expect(createdComment).toStrictEqual({
        id: "tc-123",
        content: comment.content,
        owner: comment.credentialsId,
      });
    });
  });

  describe("deleteCommentThread Function", () => {
    it("should throw NotFoundError when comment thread not found", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        username: "dicoding",
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(
        commentRepositoryPostgres.deleteCommentThread({
          credentialsId: "user-123",
          threadId: "thread-123",
          commentId: "tc-123",
        })
      ).rejects.toThrowError(NotFoundError);
    });

    it("should throw AuthorizationError when user is not comment creator", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: "user-123",
        username: "dicoding",
      });
      const date = new Date().toISOString();
      // create thread
      await ThreadsTableTestHelper.addThread({
        owner: "user-123",
        id: "thread-123",
        title: "new thread",
        body: "new body thread",
        created_at: date,
      });
      // create comment
      await CommentsTableTestHelper.addCommentThread({
        owner: "user-123",
        id: "tc-123",
        content: "new comment thread",
        threadId: "thread-123",
        created_at: date,
      });
      const commentRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(
        commentRepositoryPostgres.deleteCommentThread({
          credentialsId: "user-321",
          threadId: "thread-123",
          commentId: "tc-123",
        })
      ).rejects.toThrowError(AuthorizationError);
    });

    it("should success delete comment and return is_delete true", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: "user-123",
        username: "dicoding",
      });
      // create thread
      await ThreadsTableTestHelper.addThread({
        owner: "user-123",
        id: "thread-123",
        title: "new thread",
        body: "new body thread",
      });
      // create comment
      await CommentsTableTestHelper.addCommentThread({
        id: "tc-123",
        owner: "user-123",
        threadId: "thread-123",
        content: "new comment thread",
      });
      const fakeIdGenerator = () => "123"; // stub!
      const commentRepositoryPostgres = new CommentRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action & assert
      await expect(
        commentRepositoryPostgres.deleteCommentThread({
          credentialsId: "user-123",
          threadId: "thread-123",
          commentId: "tc-123",
        })
      ).resolves.not.toThrow();
      const comment = await CommentsTableTestHelper.findCommentThreadById(
        "thread-123",
        "tc-123"
      );
      expect(comment).toHaveLength(1);
      expect(comment[0]).toHaveProperty("is_delete", true);
    });
  });

  describe("getCommentThread", () => {
    it("should return comment list with 1 comment", async () => {
      // Arrange
      // Create Users
      await UsersTableTestHelper.addUser({
        id: "user-123",
        username: "dicoding",
      });
      // Create Thread
      await ThreadsTableTestHelper.addThread({
        owner: "user-123",
        id: "thread-123",
        title: "new thread",
        body: "new body thread",
      });
      // Create Comment
      await CommentsTableTestHelper.addCommentThread({
        owner: "user-123",
        id: "tc-123",
        content: "new comment thread",
        threadId: "thread-123",
      });
      const threadRepositoryPostgres = new CommentRepositoryPostgres(pool, {});

      // Action
      const response = await threadRepositoryPostgres.getCommentThread('thread-123')

      // Assert
      expect(Array.isArray(response)).toBe(true);
      expect(response).toHaveLength(1);
      expect(response[0].id).toBeDefined();
      expect(response[0].id).toEqual("tc-123");
      expect(response[0].owner).toBeDefined();
      expect(response[0].owner).toEqual("user-123");
      expect(response[0].content).toBeDefined();
      expect(response[0].content).toEqual("new comment thread");
      expect(response[0].thread_id).toBeDefined();
      expect(response[0].thread_id).toEqual("thread-123");
      expect(response[0].comment_id).toBeDefined();
      expect(response[0].comment_id).toEqual(null);
      expect(response[0].is_delete).toBeDefined();
      expect(response[0].date).toBeDefined();
    });
  });
});
