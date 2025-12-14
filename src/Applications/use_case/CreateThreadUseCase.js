const CreateThread = require('../../Domains/threads/entities/CreateThread');

class CreateThreadUseCase {
  constructor({ threadRepository }) {
    this._threadRepository = threadRepository;
  }

  async execute(useCasePayload) {
    this._validatePayload(useCasePayload.credentialsId);
    const createThread = new CreateThread(useCasePayload);
    return this._threadRepository.createThread(createThread);
  }

  _validatePayload(credentialsId) {
    if (!credentialsId) {
      throw new Error('CREATE_THREAD_USE_CASE.NOT_CONTAIN_AUTH_TOKEN');
    }
  }
}

module.exports = CreateThreadUseCase;
