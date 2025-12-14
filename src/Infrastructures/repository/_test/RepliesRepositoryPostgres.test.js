const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const RepliesTableTestHelper = require("../../../../tests/RepliesTableTestHelper");
const pool = require("../../database/postgres/pool");
const RepliesRepositoryPostgres = require("../RepliesRepositoryPostgres");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");
const AuthorizationError = require("../../../Commons/exceptions/AuthorizationError");

describe("RepliesRepositoryPostgres", () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("replyCommentThread", () => {
    it("should throw NotFoundError when comment or thread not found", async () => {
      // Arrange
      const users = await UsersTableTestHelper.addUser({
        username: "dicoding",
      });
      const fakeIdGenerator = () => "123"; // stub!
      const threadRepositoryPostgres = new RepliesRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action & Assert
      return expect(
        threadRepositoryPostgres.replyCommentThread({
          credentialsId: users.id,
          threadId: "thread-123",
          content: "new comment thread",
          commentId: 'tc-123'
        })
      ).rejects.toThrowError(NotFoundError);
    });

    it("should persist create reply comment thread and return created reply comment thread correctly", async () => {
      // Arrange
      // Create Users
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: "dicoding",
      });
      // Create Thread
      await ThreadsTableTestHelper.addThread({
        owner: 'user-123',
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
      const threadRepositoryPostgres = new RepliesRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      await threadRepositoryPostgres.replyCommentThread({
        credentialsId: "user-123",
        threadId: "thread-123",
        content: "new reply comment thread",
        commentId: "tc-123"
      });

      // Assert
      const comment = await RepliesTableTestHelper.findReplyCommentThreadById(
        "tcreply-123",
        "thread-123",
        "tc-123"
      );
      expect(comment).toHaveLength(1);
    });

    it("should return created reply comment thread correctly", async () => {
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
      const reply = {
        credentialsId: "user-123",
        threadId: "thread-123",
        content: "new comment thread",
        commentId: "tc-123"
      };
      const fakeIdGenerator = () => "123"; // stub!
      const threadRepositoryPostgres = new RepliesRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      const createdReplied = await threadRepositoryPostgres.replyCommentThread(
        reply
      );

      // Assert
      expect(createdReplied).toStrictEqual({
        id: "tcreply-123",
        content: reply.content,
        owner: reply.credentialsId,
      });
    });
  });

  describe("deleteCommentThread Function", () => {
    it("should throw NotFoundError when comment or thread not found", async () => {
      // Arrange
      // Create Users
      await UsersTableTestHelper.addUser({
        username: "dicoding",
      });
      const threadRepositoryPostgres = new RepliesRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(
        threadRepositoryPostgres.deleteReplyCommentThread({
          credentialsId: "user-123",
          threadId: "thread-123",
          commentId: "tc-123",
          replyId: "tcreply-123"
        })
      ).rejects.toThrowError(NotFoundError);
    });

    it("should throw AuthorizationError when user is not comment creator", async () => {
      // Arrange
      // Create User
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
        owner: "user-123",
        id: "tc-123",
        content: "new comment thread",
        threadId: "thread-123",
      });
      // create replies
      await RepliesTableTestHelper.addReplyCommentThread({
        owner: "user-123",
        id: "tcreply-123",
        content: "new comment thread",
        threadId: "thread-123",
        commentId: "tc-123",
      });
      const threadRepositoryPostgres = new RepliesRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(
        threadRepositoryPostgres.deleteReplyCommentThread({
          credentialsId: "user-321",
          threadId: "thread-123",
          commentId: "tc-123",
          replyId: "tcreply-123"
        })
      ).rejects.toThrowError(AuthorizationError);
    });

    it("should return is_delete true", async () => {
      // Arrange
      // create user
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
      // create replies
      await RepliesTableTestHelper.addReplyCommentThread({
        owner: "user-123",
        id: "tcreply-123",
        content: "new comment thread",
        threadId: "thread-123",
        commentId: "tc-123",
      });
      const fakeIdGenerator = () => "123"; // stub!
      const threadRepositoryPostgres = new RepliesRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      await threadRepositoryPostgres.deleteReplyCommentThread({
        credentialsId: "user-123",
        threadId: "thread-123",
        commentId: "tc-123",
        replyId: "tcreply-123"
      });

      // Assert
      const comment = await RepliesTableTestHelper.findReplyCommentThreadById(
        "tcreply-123",
        "thread-123",
        "tc-123"
      );
      expect(comment).toHaveLength(1);
      expect(comment[0]).toHaveProperty("is_delete", true);
    });
  });

  describe("getAllReplyByCommentId", () => {
    it("should return reply list with 1 reply", async () => {
      // Arrange
      // Create Users
      await UsersTableTestHelper.addUser({
        id: 'user-123',
        username: "dicoding",
      });
      // Create Thread
      await ThreadsTableTestHelper.addThread({
        owner: 'user-123',
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
      // create reply
      await RepliesTableTestHelper.addReplyCommentThread({
        owner: "user-123",
        id: "tcreply-123",
        content: "new reply comment thread",
        threadId: "thread-123",
        commentId: "tc-123",
      });
      const fakeIdGenerator = () => "123"; // stub!
      const threadRepositoryPostgres = new RepliesRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      const response =await threadRepositoryPostgres.getAllReplyByCommentId(['tc-123']);

      // Assert
      expect(Array.isArray(response)).toBe(true);
      expect(response).toHaveLength(1);
      expect(response[0].id).toBeDefined();
      expect(response[0].id).toEqual('tcreply-123');
      expect(response[0].owner).toBeDefined();
      expect(response[0].owner).toEqual('user-123');
      expect(response[0].content).toBeDefined();
      expect(response[0].content).toEqual('new reply comment thread');
      expect(response[0].comment_id).toBeDefined();
      expect(response[0].comment_id).toEqual('tc-123');
      expect(response[0].is_delete).toBeDefined();
      expect(response[0].date).toBeDefined();
    });
  });
});
