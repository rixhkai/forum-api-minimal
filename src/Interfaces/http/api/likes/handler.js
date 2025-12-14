const LikeCommentUseCase = require("../../../../Applications/use_case/LikeCommentUseCase");

class LikesHandler {
  constructor(container) {
    this._container = container;

    this.postLikeCommentHandler = this.postLikeCommentHandler.bind(this);
  }

  async postLikeCommentHandler(request, h) {
    console.log("postLikeCommentHandler: ", request.params);
    const { id: credentialsId } = request.auth.credentials;
    const { threadId, commentId } = request.params;
    const likeCommentThreadUseCase = this._container.getInstance(
      LikeCommentUseCase.name
    );

    // try {
      await likeCommentThreadUseCase.execute({
        ...request.payload,
        credentialsId,
        threadId,
        commentId,
      });
      const response = h.response({
        status: "success",
      });
      response.code(200);

      return response;
    // } catch (error) {
    // //   const response = h.response({
    // //     status: "failed",
    // //   });
    // //   response.code(200);

    // //   return response;
    // console.log('error postlikecomment', error);
    // throw error;
    // }
  }
}

module.exports = LikesHandler;
