const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const CreateCommentThreadUseCase = require("../CreateCommentThreadUseCase");

describe("CreateCommentThreadUseCase", () => {
  it('should throw error if use case payload not contain credentialsId', async () => {
    // Arrange
    const useCasePayload = {};
    const threadUseCase = new CreateCommentThreadUseCase({});

    // Action & Assert
    await expect(threadUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('CREATE_COMMENT_THREAD_USE_CASE.NOT_CONTAIN_AUTH_TOKEN');
  });

  it('should throw error if use case payload not contain valid payload', async () => {
    // Arrange
    const useCasePayload = {credentialsId: 'user-123'};
    const threadUseCase = new CreateCommentThreadUseCase({});

    // Action & Assert
    await expect(threadUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('CREATE_COMMENT_THREAD_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error if use case payload not contain valid data type', async () => {
    // Arrange
    const useCasePayload = {credentialsId: 'user-123', content: 2, threadId: true};
    const threadUseCase = new CreateCommentThreadUseCase({});

    // Action & Assert
    await expect(threadUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('CREATE_COMMENT_THREAD_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it("should orchestrating the create comment thread action correctly", async () => {
    // Arrange
    const useCasePayload = {
      credentialsId: "user-123",
      content: "comment thread",
      threadId: "thread-123",
    };

    const mockCreatedCommentThread = {
      id: "thread-123",
      content: useCasePayload.username,
      owner: "user-123",
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.createCommentThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockCreatedCommentThread));

    /** creating use case instance */
    const getThreadUseCase = new CreateCommentThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const createdCommentThread = await getThreadUseCase.execute(useCasePayload);

    // Assert
    expect(createdCommentThread).toStrictEqual({
      id: "thread-123",
      content: useCasePayload.username,
      owner: "user-123",
    });

    expect(mockThreadRepository.createCommentThread).toBeCalledWith({
      credentialsId: "user-123",
      content: "comment thread",
      threadId: "thread-123",
    });
  });
});
