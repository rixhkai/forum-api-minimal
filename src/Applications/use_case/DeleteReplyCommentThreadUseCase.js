class DeleteReplyCommentThreadUseCase {
  constructor({
    threadRepository,
  }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    this._validatePayload(useCasePayload);
    await this._threadRepository.deleteReplyCommentThread(useCasePayload);
  }

  _validatePayload(payload) {
    const { credentialsId, threadId, commentId, replyId } = payload;
    if (!credentialsId) {
      throw new Error('DELETE_REPLY_COMMENT_THREAD_USE_CASE.NOT_CONTAIN_AUTH_TOKEN');
    }

    if (!threadId || !commentId || !replyId) {
      throw new Error('DELETE_REPLY_COMMENT_THREAD_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof threadId !== 'string' || typeof commentId !== 'string' || typeof replyId !== 'string') {
      throw new Error('DELETE_REPLY_COMMENT_THREAD_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = DeleteReplyCommentThreadUseCase;
