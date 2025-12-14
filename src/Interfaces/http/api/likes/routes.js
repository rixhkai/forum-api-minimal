const routes = (handler) => ([
  {
    method: 'PUT',
    path: '/threads/{threadId}/comments/{commentId}/likes',
    handler: handler.postLikeCommentHandler,
    options: {
      auth: 'auth_jwt'
    }
  }
]);

module.exports = routes;
