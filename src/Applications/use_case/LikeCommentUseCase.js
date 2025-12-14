class LikeCommentUseCase {
  constructor({ likeRepository }) {
    this._likeRepository = likeRepository;
  }

  async execute(useCasePayload) {
    console.log('execute likeCommentUseCase:', useCasePayload);
    this._validatePayload(useCasePayload);
    const likeResult = await this._likeRepository.getLikesById(useCasePayload);
    if (likeResult && likeResult.length != 0) {
      await this._likeRepository.deleteLikeCommentThread(useCasePayload);
    } else {
      await this._likeRepository.likeCommentThread(useCasePayload);
    }
  }

  _validatePayload(payload) {
    const { credentialsId, threadId, commentId } = payload;
    if (!credentialsId) {
      throw new Error('LIKE_COMMENT_USE_CASE.NOT_CONTAIN_AUTH_TOKEN');
    }
    if (!threadId || !commentId) {
      throw new Error('LIKE_COMMENT_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof threadId !== 'string' || typeof commentId !== 'string') {
      throw new Error('LIKE_COMMENT_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = LikeCommentUseCase;
