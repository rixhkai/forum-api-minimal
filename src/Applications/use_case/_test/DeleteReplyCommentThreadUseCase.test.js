const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const DeleteReplyCommentThreadUseCase = require("../DeleteReplyCommentThreadUseCase");

describe("DeleteReplyCommentThreadUseCase", () => {
  it('should throw error if use case payload not contain credentialsId', async () => {
    // Arrange
    const useCasePayload = {};
    const deleteReplyCommentThreadUseCase = new DeleteReplyCommentThreadUseCase({});

    // Action & Assert
    await expect(deleteReplyCommentThreadUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('DELETE_REPLY_COMMENT_THREAD_USE_CASE.NOT_CONTAIN_AUTH_TOKEN');
  });

  it('should throw error if use case payload not contain valid payload', async () => {
    // Arrange
    const useCasePayload = {credentialsId: 'user-123'};
    const deleteReplyCommentThreadUseCase = new DeleteReplyCommentThreadUseCase({});

    // Action & Assert
    await expect(deleteReplyCommentThreadUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('DELETE_REPLY_COMMENT_THREAD_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error if use case payload not contain valid data type', async () => {
    // Arrange
    const useCasePayload = {credentialsId: 'user-123', threadId: 'true', commentId: '123', replyId: 32};
    const threadUseCase = new DeleteReplyCommentThreadUseCase({});

    // Action & Assert
    await expect(threadUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('DELETE_REPLY_COMMENT_THREAD_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it("should orchestrating the delete comment thread action correctly", async () => {
    // Arrange
    const useCasePayload = {
      credentialsId: "user-123",
      threadId: "thread-123",
      commentId: "tc-123",
      replyId: "tcreply-123"
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.deleteReplyCommentThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const getThreadUseCase = new DeleteReplyCommentThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    await getThreadUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.deleteReplyCommentThread).toBeCalledWith({
      credentialsId: "user-123",
      threadId: "thread-123",
      commentId: "tc-123",
      replyId: "tcreply-123"
    });
  });
});
