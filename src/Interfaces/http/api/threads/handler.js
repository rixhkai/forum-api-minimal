const CreateThreadUseCase = require('../../../../Applications/use_case/CreateThreadUseCase');
const DetailThreadUseCase = require('../../../../Applications/use_case/DetailThreadUseCase');
const NotFoundError = require('../../../../Commons/exceptions/NotFoundError');

class ThreadsHandler {
  constructor(container) {
    this._container = container;

    this.postThreadHandler = this.postThreadHandler.bind(this);
    this.getDetailHandler = this.getDetailHandler.bind(this);
  }

  async postThreadHandler(request, h) {
    const { id: credentialsId } = request.auth.credentials;
    const createThreadUseCase = this._container.getInstance(CreateThreadUseCase.name);
    const addedThread = await createThreadUseCase.execute({...request.payload, credentialsId});
    const response = h.response({
      status: 'success',
      data: {
        addedThread
      },
    });
    response.code(201);
    return response;
  }

  async getDetailHandler(request) {
    console.log('getDetailHandler:', request.params);
    const { threadId } = request.params;
    try {
      const detailThreadUseCase = this._container.getInstance(DetailThreadUseCase.name);
      const thread = await detailThreadUseCase.execute({ threadId });
      return {
        status: 'success',
        data: {
          thread
        }
      };  
    } catch (error) {
      console.log('err getDetailHandler:', error);
      throw new NotFoundError("thread not found");
    }
    
  }
}

module.exports = ThreadsHandler;
