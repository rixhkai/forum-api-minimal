class ReplyCommentThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    console.log('execute replyCommentThreadUseCase:', useCasePayload);
    this._validatePayload(useCasePayload);
    return this._threadRepository.replyCommentThread(useCasePayload);
  }

  _validatePayload(payload) {
    const { content, credentialsId, threadId, commentId } = payload;
    if (!credentialsId) {
      throw new Error('REPLY_COMMENT_THREAD_USE_CASE.NOT_CONTAIN_AUTH_TOKEN');
    }
    if (!content || !threadId || !commentId) {
      throw new Error('REPLY_COMMENT_THREAD_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof content !== 'string' || typeof threadId !== 'string' || typeof commentId !== 'string') {
      throw new Error('REPLY_COMMENT_THREAD_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = ReplyCommentThreadUseCase;
