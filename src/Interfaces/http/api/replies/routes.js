const routes = (handler) => ([
  {
    method: 'POST',
    path: '/threads/{threadId}/comments/{commentId}/replies',
    handler: handler.postReplyCommentHandler,
    options: {
      auth: 'auth_jwt'
    }
  },
  {
    method: 'DELETE',
    path: '/threads/{threadId}/comments/{commentId}/replies/{replyId}',
    handler: handler.deleteReplyCommentHandler,
    options: {
      auth: 'auth_jwt'
    }
  },
]);

module.exports = routes;
