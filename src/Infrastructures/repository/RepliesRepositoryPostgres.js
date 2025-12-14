const AuthorizationError = require("../../Commons/exceptions/AuthorizationError");
const NotFoundError = require("../../Commons/exceptions/NotFoundError");
const RepliesRepository = require("../../Domains/replies/RepliesRepository");

class RepliesRepositoryPostgres extends RepliesRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async replyCommentThread(addCommentThread) {
    // console.log("replyeCommentThread: before", addCommentThread);
    const { credentialsId, content, threadId, commentId } = addCommentThread;
    const id = `tcreply-${this._idGenerator()}`;
    const createdAt = new Date().toISOString();
    // console.log("createCommentThread:", addCommentThread);

    const queryComment = {
      text: "SELECT id FROM thread_comments WHERE id = $1 AND thread_id = $2",
      values: [commentId, threadId],
    };

    const resultComment = await this._pool.query(queryComment);
    // console.log("resultComment", resultComment);

    if (!resultComment.rowCount) {
      throw new NotFoundError("comment or thread not found");
    }

    const query = {
      text: "INSERT INTO thread_comments (id, content, thread_id, owner, created_at, comment_id) VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner",
      values: [id, content, threadId, credentialsId, createdAt, commentId],
    };

    const result = await this._pool.query(query);

    return { ...result.rows[0] };
  }

  async deleteReplyCommentThread(payloadDeleteComment) {
    const { credentialsId, threadId, commentId, replyId } =
      payloadDeleteComment;
    // console.log("deleteReplyCommentThreadRepo: start", payloadDeleteComment);

    const queryValidate = {
      text: `SELECT thread_comments.owner FROM thread_comments
      WHERE thread_comments.id = $1
        AND thread_comments.thread_id = $2
        AND thread_comments.comment_id = $3`,
      values: [replyId, threadId, commentId],
    };

    const resultValidate = await this._pool.query(queryValidate);
    if (!resultValidate.rowCount) {
      throw new NotFoundError("reply or comment or thread not found");
    }
    // console.log("resultValidate", resultValidate.rows);

    if (credentialsId != resultValidate.rows[0].owner) {
      throw new AuthorizationError(`not authorized to do this action`);
    }

    const query = {
      text: `UPDATE thread_comments set is_delete = true
        WHERE thread_comments.id = $1
          AND thread_comments.thread_id = $2
          AND thread_comments.comment_id = $3`,
      values: [replyId, threadId, commentId],
    };

    const result = await this._pool.query(query);

    // console.log(
    //   "deleteCommentThread: result-",
    //   result,
    //   result.rows,
    //   result.rowCount
    // );

    return result.rows[0];
  }

  async getAllReplyByCommentId(arrayCommentId) {
    let whereClauseReply = "";
    /* istanbul ignore next */
    for (const id of arrayCommentId) {
      whereClauseReply += `${
        whereClauseReply == "" ? "WHERE " : " OR "
      }tc.comment_id = '${id}'`;
    }

    const queryReply = {
      text: `SELECT tc.id,
                    tc.content,
                    tc.created_at as date,
                    tc.owner,
                    tc.comment_id,
                    tc.is_delete
        FROM thread_comments as tc
        ${whereClauseReply}
        ORDER BY tc.created_at ASC`,
      values: [],
    };

    const resultReply = await this._pool.query(queryReply);

    // always return array regardless if replies is found or not
    return resultReply.rows;
  }
}

module.exports = RepliesRepositoryPostgres;
