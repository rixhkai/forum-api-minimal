class CreateCommentThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    console.log('execute creatCommentThreadUseCase:', useCasePayload);
    this._validatePayload(useCasePayload);
    return this._threadRepository.createCommentThread(useCasePayload);
  }

  _validatePayload(payload) {
    const { content, credentialsId, threadId } = payload;
    if (!credentialsId) {
      throw new Error('CREATE_COMMENT_THREAD_USE_CASE.NOT_CONTAIN_AUTH_TOKEN');
    }
    if (!content || !threadId ) {
      throw new Error('CREATE_COMMENT_THREAD_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY');
    }

    if (typeof content !== 'string' || typeof threadId !== 'string') {
      throw new Error('CREATE_COMMENT_THREAD_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION');
    }
  }
}

module.exports = CreateCommentThreadUseCase;
