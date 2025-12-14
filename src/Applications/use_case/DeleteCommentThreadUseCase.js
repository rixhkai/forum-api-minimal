class DeleteCommentThreadUseCase {
  constructor({
    threadRepository,
  }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    this._validatePayload(useCasePayload);
    await this._threadRepository.deleteCommentThread(useCasePayload);
  }

  _validatePayload(payload) {
    const { credentialsId, threadId, commentId } = payload;
    if (!credentialsId) {
      throw new Error('DELETE_COMMENT_THREAD_USE_CASE.NOT_CONTAIN_AUTH_TOKEN');
    }

    if (!threadId || !commentId) {
      throw new Error('DELETE_COMMENT_THREAD_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof threadId !== 'string' || typeof commentId !== 'string') {
      throw new Error('DELETE_COMMENT_THREAD_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DeleteCommentThreadUseCase;
