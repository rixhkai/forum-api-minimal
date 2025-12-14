const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const LikesTableTestHelper = require("../../../../tests/LikesTableTestHelper");
const pool = require("../../database/postgres/pool");
const LikeRepositoryPostgres = require("../LikeRepositoryPostgres");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");

describe("LikeRepositoryPostgres", () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await LikesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("likeCommentThread", () => {
    it("should throw NotFoundError when comment or thread not found", async () => {
      // Arrange
      const users = await UsersTableTestHelper.addUser({
        username: "dicoding",
      });
      const fakeIdGenerator = () => "123"; // stub!
      const threadRepositoryPostgres = new LikeRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action & Assert
      return expect(
        threadRepositoryPostgres.likeCommentThread({
          credentialsId: users.id,
          threadId: "thread-123",
          commentId: "tc-123",
        })
      ).rejects.toThrowError(NotFoundError);
    });

    it("should persist like comment thread correctly", async () => {
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
      const fakeIdGenerator = () => "123"; // stub!
      const threadRepositoryPostgres = new LikeRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      await expect(threadRepositoryPostgres.likeCommentThread({
        credentialsId: "user-123",
        threadId: "thread-123",
        commentId: "tc-123",
      })).resolves.not.toThrow();

      // Assert
      const like = await LikesTableTestHelper.findLikeCommentThreadById(
        "user-123",
        "thread-123",
        "tc-123"
      );
      expect(like).toHaveLength(1);
    });

    it("should unlike comment thread correctly", async () => {
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
      // Create Comments
      await CommentsTableTestHelper.addCommentThread({
        owner: "user-123",
        id: "tc-123",
        content: "new comment thread",
        threadId: "thread-123",
      });
      const comment = {
        credentialsId: "user-123",
        threadId: "thread-123",
        commentId: "tc-123",
      };
      const fakeIdGenerator = () => "123"; // stub!
      const threadRepositoryPostgres = new LikeRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      await expect(
        threadRepositoryPostgres.likeCommentThread(comment)
      ).resolves.not.toThrow();
      await expect(
        threadRepositoryPostgres.deleteLikeCommentThread(comment)
      ).resolves.not.toThrow();

      // Assert
      const like = await LikesTableTestHelper.findLikeCommentThreadById(
        "user-123",
        "thread-123",
        "tc-123"
      );
      expect(like).toHaveLength(0);
    });
  });

  describe("getLikesById", () => {
    it("should return 1 likes object", async () => {
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
      const likesObj = {
        credentialsId: "user-123",
        threadId: "thread-123",
        commentId: "tc-123",
      };
      // create likes
      await LikesTableTestHelper.likeCommentThread(likesObj);
      const threadRepositoryPostgres = new LikeRepositoryPostgres(pool, {});

      // Action
      const response = await threadRepositoryPostgres.getLikesById(likesObj);

      // Assert
      expect(Array.isArray(response)).toBe(true);
      expect(response).toHaveLength(1);
      expect(response[0].id).toBeDefined();
      expect(response[0].owner).toBeDefined();
      expect(response[0].owner).toEqual("user-123");
      expect(response[0].thread_id).toBeDefined();
      expect(response[0].thread_id).toEqual("thread-123");
      expect(response[0].comment_id).toBeDefined();
      expect(response[0].comment_id).toEqual("tc-123");
      expect(response[0].date).toBeDefined();
    });
  });
});
