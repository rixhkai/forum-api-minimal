const AuthorizationError = require("../../Commons/exceptions/AuthorizationError");
const NotFoundError = require("../../Commons/exceptions/NotFoundError");
const CommentRepository = require("../../Domains/comments/CommentRepository");

class CommentRepositoryPostgres extends CommentRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async createCommentThread(addCommentThread) {
    // console.log("createCommentThread: before", addCommentThread);
    const { credentialsId, content, threadId } = addCommentThread;
    const id = `tc-${this._idGenerator()}`;
    const createdAt = new Date().toISOString();
    // console.log("createCommentThread:", addCommentThread);

    const query = {
      text: "INSERT INTO thread_comments (id, content, thread_id, owner, created_at) VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner",
      values: [id, content, threadId, credentialsId, createdAt],
    };

    try {
      const result = await this._pool.query(query);

      return { ...result.rows[0] };
    } catch (error) {
      // console.log("createCommentThread: errorQuery-", error);
      throw new NotFoundError("thread not found");
    }
  }

  async deleteCommentThread(payloadDeleteComment) {
    const { credentialsId, threadId, commentId } = payloadDeleteComment;
    // console.log("deleteCommentThreadRepo: start", payloadDeleteComment);

    // start query validation if thread or comment exist or not
    // it was not split into different function because:
    // - insert comment to db already return error if reference column is not found
    // - so it will be waste performance if use multiple query, if 1 query Insert already do the job
    // - if splitting query delete and validattion it will make it convoluted, especially if it only use in 1 place
    // - remember KISS (Keep it Simple, Stupid) Methodology
    // - if needed in many place with the exact same query, of course need to split function for simplicity
    const queryValidate = {
      text: "SELECT thread_comments.owner FROM thread_comments WHERE thread_comments.id = $1 AND thread_comments.thread_id = $2",
      values: [commentId, threadId],
    };

    const resultValidate = await this._pool.query(queryValidate);
    if (!resultValidate.rowCount) {
      throw new NotFoundError("comment thread not found");
    }
    // console.log("resultValidate", resultValidate.rows);

    if (credentialsId != resultValidate.rows[0].owner) {
      throw new AuthorizationError(`not authorized to do this action`);
    }

    const query = {
      text: "UPDATE thread_comments set is_delete = true WHERE thread_comments.id = $1 AND thread_comments.thread_id = $2",
      values: [commentId, threadId],
    };

    const result = await this._pool.query(query);
    // console.log('result delete comment thread', result.rows);
    return result.rows[0];
  }

  async getCommentThread(threadId) {
    const queryCommentList = {
      text: `SELECT tc.id,
                    tc.content,
                    tc.created_at as date,
                    tc.owner,
                    tc.comment_id,
                    tc.is_delete,
                    tc.thread_id,
                    count(distinct l.id) as likeCount
      FROM thread_comments as tc
      LEFT JOIN comment_likes as l 
        ON l.comment_id = tc.id
      WHERE tc.thread_id = $1 AND tc.comment_id is null
      GROUP BY tc.id
      ORDER BY tc.created_at ASC`,
      values: [threadId],
    };

    const resultComment = await this._pool.query(queryCommentList);
    console.log('result commentGetThread', resultComment);

    // always return array regardless if comment is found or not
    return resultComment.rows;
  }
}

module.exports = CommentRepositoryPostgres;
