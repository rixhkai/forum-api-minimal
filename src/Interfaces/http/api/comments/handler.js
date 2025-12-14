const CreateCommentThreadUseCase = require('../../../../Applications/use_case/CreateCommentThreadUseCase');
const DeleteCommentThreadUseCase = require('../../../../Applications/use_case/DeleteCommentThreadUseCase');

class CommentsHandler {
  constructor(container) {
    this._container = container;

    this.postCommentHandler = this.postCommentHandler.bind(this);
    this.deleteCommentHandler = this.deleteCommentHandler.bind(this);
  }

  async postCommentHandler(request, h) {
    console.log('postCommentHandler: ', request.params);
    const { id: credentialsId } = request.auth.credentials;
    const { threadId } = request.params;
    const createCommentThreadUseCase = this._container
      .getInstance(CreateCommentThreadUseCase.name);
    const addedComment = await createCommentThreadUseCase.execute({...request.payload, credentialsId, threadId});

    const response = h.response({
      status: 'success',
      data: {
        addedComment,
      },
    });
    response.code(201);

    return response;
  }

  async deleteCommentHandler(request) {
    const { id: credentialsId } = request.auth.credentials;
    const { threadId, commentId } = request.params;
    const deleteCommentUseCase = this._container.getInstance(DeleteCommentThreadUseCase.name);
    await deleteCommentUseCase.execute({ credentialsId, threadId, commentId });
    return {
      status: 'success',
    };
  }
}

module.exports = CommentsHandler;
