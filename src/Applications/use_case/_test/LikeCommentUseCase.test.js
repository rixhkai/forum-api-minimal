const LikeRepository = require("../../../Domains/likes/LikeRepository");
const LikeCommentUseCase = require("../LikeCommentUseCase");

describe("LikeCommentUseCase", () => {
  it('should throw error if use case payload not contain credentialsId', async () => {
    // Arrange
    const useCasePayload = {};
    const threadUseCase = new LikeCommentUseCase({});

    // Action & Assert
    await expect(threadUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('LIKE_COMMENT_USE_CASE.NOT_CONTAIN_AUTH_TOKEN');
  });

  it('should throw error if use case payload not contain valid payload', async () => {
    // Arrange
    const useCasePayload = {credentialsId: 'user-123'};
    const threadUseCase = new LikeCommentUseCase({});

    // Action & Assert
    await expect(threadUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('LIKE_COMMENT_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error if use case payload not contain valid data type', async () => {
    // Arrange
    const useCasePayload = {credentialsId: 'user-123', threadId: '123', commentId: true};
    const threadUseCase = new LikeCommentUseCase({});

    // Action & Assert
    await expect(threadUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('LIKE_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it("should orchestrating the like comment action correctly", async () => {
    // Arrange
    const useCasePayload = {
      credentialsId: "user-123",
      commentId: "tc-123",
      threadId: "thread-123",
    };

    /** creating dependency of use case */
    const mockLikeRepository = new LikeRepository();

    /** mocking needed function */
    mockLikeRepository.getLikesById = jest
      .fn()
      .mockImplementation(() => Promise.resolve([]));
    mockLikeRepository.likeCommentThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const getThreadUseCase = new LikeCommentUseCase({
      likeRepository: mockLikeRepository,
    });

    // Action
    await getThreadUseCase.execute(useCasePayload);

    expect(mockLikeRepository.likeCommentThread).toBeCalledWith({
      credentialsId: "user-123",
      commentId: "tc-123",
      threadId: "thread-123",
    });
  });

  it("should orchestrating the unlike comment action correctly", async () => {
    // Arrange
    const useCasePayload = {
      credentialsId: "user-123",
      commentId: "tc-123",
      threadId: "thread-123",
    };

    const mockExistingLike = {
      id: "likes-123",
      owner: "user-123",
      comment_id: "tc-123",
      thread_id: "thread-123",
      date: new Date().toISOString()
    };

    /** creating dependency of use case */
    const mockLikeRepository = new LikeRepository();

    /** mocking needed function */
    mockLikeRepository.getLikesById = jest
      .fn()
      .mockImplementation(() => Promise.resolve([mockExistingLike]));
    mockLikeRepository.deleteLikeCommentThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const getThreadUseCase = new LikeCommentUseCase({
      likeRepository: mockLikeRepository,
    });

    // Action
    await getThreadUseCase.execute(useCasePayload);

    expect(mockLikeRepository.deleteLikeCommentThread).toBeCalledWith({
      credentialsId: "user-123",
      commentId: "tc-123",
      threadId: "thread-123",
    });
  });
});
