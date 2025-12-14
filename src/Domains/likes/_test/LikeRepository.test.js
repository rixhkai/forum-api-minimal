const LikesRepository = require('../LikeRepository');

describe('likesRepository interface', () => {
  it('should throw error when invoke abstract behavior', async () => {
    // Arrange
    const likesRepository = new LikesRepository();

    // Action and Assert
    await expect(likesRepository.likeCommentThread({})).rejects.toThrowError('LIKES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(likesRepository.deleteLikeCommentThread({})).rejects.toThrowError('LIKES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(likesRepository.getLikesById({})).rejects.toThrowError('LIKES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
    await expect(likesRepository.getLikeCount('')).rejects.toThrowError('LIKES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  });
});
