const RepliesRepository = require('../RepliesRepository');

describe('RepliesRepository interface', () => {
  it('should throw error when invoke abstract behavior', async () => {
    // Arrange
    const repliesRepository = new RepliesRepository();

    // Action and Assert
    await expect(repliesRepository.replyCommentThread({})).rejects.toThrowError('REPLIES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(repliesRepository.deleteReplyCommentThread({})).rejects.toThrowError('REPLIES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(repliesRepository.getAllReplyByCommentId([])).rejects.toThrowError('REPLIES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
