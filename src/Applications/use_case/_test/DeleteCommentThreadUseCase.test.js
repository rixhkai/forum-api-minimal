const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const DeleteCommentThreadUseCase = require("../DeleteCommentThreadUseCase");

describe("DeleteCommentThreadUseCase", () => {
  it('should throw error if use case payload not contain credentialsId', async () => {
    // Arrange
    const useCasePayload = {};
    const deleteCommentThreadUseCase = new DeleteCommentThreadUseCase({});

    // Action & Assert
    await expect(deleteCommentThreadUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('DELETE_COMMENT_THREAD_USE_CASE.NOT_CONTAIN_AUTH_TOKEN');
  });

  it('should throw error if use case payload not contain valid payload', async () => {
    // Arrange
    const useCasePayload = {credentialsId: 'user-123'};
    const deleteCommentThreadUseCase = new DeleteCommentThreadUseCase({});

    // Action & Assert
    await expect(deleteCommentThreadUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('DELETE_COMMENT_THREAD_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error if use case payload not contain valid data type', async () => {
    // Arrange
    const useCasePayload = {credentialsId: 'user-123', threadId: true, commentId: 1};
    const threadUseCase = new DeleteCommentThreadUseCase({});

    // Action & Assert
    await expect(threadUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('DELETE_COMMENT_THREAD_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it("should orchestrating the delete comment thread action correctly", async () => {
    // Arrange
    const useCasePayload = {
      credentialsId: "user-123",
      threadId: "thread-123",
      commentId: "tc-123"
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.deleteCommentThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve());

    /** creating use case instance */
    const getThreadUseCase = new DeleteCommentThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    await getThreadUseCase.execute(useCasePayload);

    // Assert
    expect(mockThreadRepository.deleteCommentThread).toBeCalledWith({
      credentialsId: "user-123",
      threadId: "thread-123",
      commentId: "tc-123"
    });
  });
});
