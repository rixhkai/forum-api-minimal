class LikesRepository {
  async likeCommentThread(likeComment) {
    throw new Error('LIKES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async deleteLikeCommentThread(likeComment) {
    throw new Error('LIKES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  // parameter commentId, threadId & credentialsId
  async getLikesById(likeComment) {
    throw new Error('LIKES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }

  async getLikeCount(commmentId) {
    throw new Error('LIKES_REPOSITORY.METHOD_NOT_IMPLEMENTED');
  }
}

module.exports = LikesRepository;
