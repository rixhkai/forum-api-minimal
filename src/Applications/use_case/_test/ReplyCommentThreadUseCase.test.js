const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const ReplyCommentThreadUseCase = require("../ReplyCommentThreadUseCase");

describe("ReplyCommentThreadUseCase", () => {
  it('should throw error if use case payload not contain credentialsId', async () => {
    // Arrange
    const useCasePayload = {};
    const threadUseCase = new ReplyCommentThreadUseCase({});

    // Action & Assert
    await expect(threadUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('REPLY_COMMENT_THREAD_USE_CASE.NOT_CONTAIN_AUTH_TOKEN');
  });

  it('should throw error if use case payload not contain valid payload', async () => {
    // Arrange
    const useCasePayload = {credentialsId: 'user-123'};
    const threadUseCase = new ReplyCommentThreadUseCase({});

    // Action & Assert
    await expect(threadUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('REPLY_COMMENT_THREAD_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error if use case payload not contain valid data type', async () => {
    // Arrange
    const useCasePayload = {credentialsId: 'user-123', content: '2', threadId: 'true', commentId: 2};
    const threadUseCase = new ReplyCommentThreadUseCase({});

    // Action & Assert
    await expect(threadUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('REPLY_COMMENT_THREAD_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it("should orchestrating the reply comment thread action correctly", async () => {
    // Arrange
    const useCasePayload = {
      credentialsId: "user-123",
      content: "comment thread",
      threadId: "thread-123",
      commentId: 'tc-123'
    };

    const mockCreatedReplyCommentThread = {
      id: "tcreply-123",
      content: useCasePayload.content,
      owner: useCasePayload.credentialsId,
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.replyCommentThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockCreatedReplyCommentThread));

    /** creating use case instance */
    const getThreadUseCase = new ReplyCommentThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const createdReplyCommentThread = await getThreadUseCase.execute(useCasePayload);

    // Assert
    expect(createdReplyCommentThread).toStrictEqual({
      id: "tcreply-123",
      content: useCasePayload.content,
      owner: useCasePayload.credentialsId,
    });

    expect(mockThreadRepository.replyCommentThread).toBeCalledWith({
      credentialsId: "user-123",
      content: "comment thread",
      threadId: "thread-123",
      commentId: 'tc-123'
    });
  });
});
