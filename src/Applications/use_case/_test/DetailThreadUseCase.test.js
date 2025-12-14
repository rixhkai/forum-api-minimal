const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const CommentRepository = require("../../../Domains/comments/CommentRepository");
const RepliesRepository = require("../../../Domains/replies/RepliesRepository");
const UserRepository = require("../../../Domains/users/UserRepository");
const DetailThreadUseCase = require("../DetailThreadUseCase");

describe("DetailThreadUseCase", () => {
  it("should throw error if use case payload not contain valid payload", async () => {
    // Arrange
    const useCasePayload = {};
    const detailThreadUseCase = new DetailThreadUseCase({});

    // Action & Assert
    await expect(
      detailThreadUseCase.execute(useCasePayload)
    ).rejects.toThrowError(
      "DETAIL_THREAD_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY"
    );
  });

  it("should throw error if use case payload not contain valid data type", async () => {
    // Arrange
    const useCasePayload = { threadId: true };
    const threadUseCase = new DetailThreadUseCase({});

    // Action & Assert
    await expect(threadUseCase.execute(useCasePayload)).rejects.toThrowError(
      "DETAIL_THREAD_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION"
    );
  });

  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it("should orchestrating the get detail thread action correctly", async () => {
    // Arrange
    const useCasePayload = {
      threadId: "thread-123",
    };

    const mockDate = new Date().toISOString();

    const mockDetailThread = {
      id: useCasePayload.threadId,
      title: "title thread",
      body: "body thread",
      date: mockDate,
      username: "dicoding",
      // comments: [
      //   {
      //     id: "tc-123",
      //     username: "dicoding",
      //     date: mockDate,
      //     content: "comment thread",
      //     replies: [
      //       {
      //         id: "tcreply-123",
      //         username: "batman",
      //         date: mockDate,
      //         content: "reply comment thread",
      //       },
      //     ],
      //   },
      // ],
    };

    const mockCommentThread = [
      {
        id: "tc-123",
        owner: "user-123",
        date: mockDate,
        content: "comment thread",
        comment_id: null,
        is_delete: false,
        thread_id: useCasePayload.threadId,
      },
    ];

    const mockReplyComment = [
      {
        id: "tcreply-123",
        owner: "user-321",
        date: mockDate,
        content: "reply thread",
        comment_id: "tc-123",
        is_delete: false,
      },
    ];

    const mockUsers = [
      {
        id: "user-123",
        username: "dicoding",
      },
      {
        id: 'user-321',
        username: 'batman'
      }
    ];

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();
    const mockCommentRepository = new CommentRepository();
    const mockRepliesRepository = new RepliesRepository();
    const mockUserRepository = new UserRepository();

    /** mocking needed function */
    mockThreadRepository.getDetailThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockDetailThread));
    mockCommentRepository.getCommentThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockCommentThread));
    mockRepliesRepository.getAllReplyByCommentId = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockReplyComment));
    mockUserRepository.getUserListById = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockUsers));

    /** creating use case instance */
    const getThreadUseCase = new DetailThreadUseCase({
      threadRepository: mockThreadRepository,
      commentRepository: mockCommentRepository,
      repliesRepository: mockRepliesRepository,
      userRepository: mockUserRepository,
    });

    // Action
    const detailThread = await getThreadUseCase.execute(useCasePayload);

    // Assert
    expect(detailThread).toStrictEqual({
      id: useCasePayload.threadId,
      title: "title thread",
      body: "body thread",
      date: mockDate,
      username: "dicoding",
      comments: [
        {
          id: "tc-123",
          username: "dicoding",
          date: mockDate,
          content: "comment thread",
          replies: [
            {
              id: "tcreply-123",
              username: "batman",
              date: mockDate,
              content: "reply thread",
            },
          ],
        },
      ],
    });
    expect(mockThreadRepository.getDetailThread).toBeCalledWith("thread-123");
  });
});
