const ReplyCommentThreadUseCase = require('../../../../Applications/use_case/ReplyCommentThreadUseCase');
const DeleteReplyCommentThreadUseCase = require('../../../../Applications/use_case/DeleteReplyCommentThreadUseCase');

class RepliesHandler {
  constructor(container) {
    this._container = container;

    this.postReplyCommentHandler = this.postReplyCommentHandler.bind(this);
    this.deleteReplyCommentHandler = this.deleteReplyCommentHandler.bind(this);
  }

  async postReplyCommentHandler(request, h) {
    console.log('postReplyCommentHandler: ', request.params);
    const { id: credentialsId } = request.auth.credentials;
    const { threadId, commentId } = request.params;
    const replyCommentThreadUseCase = this._container
      .getInstance(ReplyCommentThreadUseCase.name);
    const addedReply = await replyCommentThreadUseCase.execute({...request.payload, credentialsId, threadId, commentId});

    const response = h.response({
      status: 'success',
      data: {
        addedReply,
      },
    });
    response.code(201);

    return response;
  }

  async deleteReplyCommentHandler(request) {
    const { id: credentialsId } = request.auth.credentials;
    const { threadId, commentId, replyId } = request.params;
    const deleteReplyCommentUseCase = this._container.getInstance(DeleteReplyCommentThreadUseCase.name);
    await deleteReplyCommentUseCase.execute({ credentialsId, threadId, commentId, replyId });
    return {
      status: 'success',
    };
  }
}

module.exports = RepliesHandler;
