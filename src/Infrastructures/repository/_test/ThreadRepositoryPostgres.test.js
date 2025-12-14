const UsersTableTestHelper = require("../../../../tests/UsersTableTestHelper");
const ThreadsTableTestHelper = require("../../../../tests/ThreadsTableTestHelper");
const CommentsTableTestHelper = require("../../../../tests/CommentsTableTestHelper");
const RepliesTableTestHelper = require("../../../../tests/RepliesTableTestHelper");
const pool = require("../../database/postgres/pool");
const ThreadRepositoryPostgres = require("../ThreadRepositoryPostgres");
const NotFoundError = require("../../../Commons/exceptions/NotFoundError");

describe("ThreadRepositoryPostgres", () => {
  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  describe("createThread function", () => {
    it("should persist create thread and return created thread correctly", async () => {
      // Arrange
      const users = await UsersTableTestHelper.addUser({
        username: "dicoding",
      });
      const fakeIdGenerator = () => "123"; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      await threadRepositoryPostgres.createThread({
        credentialsId: users.id,
        title: "new Thread",
        body: "new thread body",
      });

      // Assert
      const thread = await ThreadsTableTestHelper.findThreadById("thread-123");
      expect(thread).toHaveLength(1);
    });

    it("should return created thread correctly", async () => {
      // Arrange
      const users = await UsersTableTestHelper.addUser({
        username: "dicoding",
      });
      const thread = {
        credentialsId: users.id,
        title: "new Thread",
        body: "new thread body",
      };
      const fakeIdGenerator = () => "123"; // stub!
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(
        pool,
        fakeIdGenerator
      );

      // Action
      const createdThread = await threadRepositoryPostgres.createThread(thread);

      // Assert
      expect(createdThread).toStrictEqual({
        id: "thread-123",
        title: thread.title,
        owner: thread.credentialsId,
      });
    });
  });

  describe("getDetailThread Function", () => {
    it("should throw NotFoundError when thread not found", () => {
      // Arrange
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      return expect(
        threadRepositoryPostgres.getDetailThread("dicoding")
      ).rejects.toThrowError(NotFoundError);
    });

    it("should return thread detail when thread is found", async () => {
      // Arrange
      await UsersTableTestHelper.addUser({
        id: "user-123",
        username: "dicoding",
      });
      const date = new Date().toISOString();
      console.log("date thread before", date);
      await ThreadsTableTestHelper.addThread({
        owner: "user-123",
        id: "thread-123",
        title: "new thread",
        body: "new body thread",
        created_at: date,
      });
      const threadRepositoryPostgres = new ThreadRepositoryPostgres(pool, {});

      // Action & Assert
      const thread = await threadRepositoryPostgres.getDetailThread(
        "thread-123"
      );
      expect(thread).toStrictEqual({
        id: "thread-123",
        title: "new thread",
        body: "new body thread",
        date: date,
        username: "dicoding",
      });
    });
  });
});
