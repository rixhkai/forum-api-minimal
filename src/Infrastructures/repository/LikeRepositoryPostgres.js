const AuthorizationError = require("../../Commons/exceptions/AuthorizationError");
const NotFoundError = require("../../Commons/exceptions/NotFoundError");
const LikeRepository = require("../../Domains/likes/LikeRepository");

class LikeRepositoryPostgres extends LikeRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async likeCommentThread(likeComment) {
    const { credentialsId, threadId, commentId } = likeComment;
    const id = `likes-${this._idGenerator()}`;
    const createdAt = new Date().toISOString();
    // console.log("createCommentThread:", addCommentThread);

    try {
      const query = {
        text: "INSERT INTO comment_likes (id, thread_id, owner, created_at, comment_id) VALUES($1, $2, $3, $4, $5)",
        values: [id, threadId, credentialsId, createdAt, commentId],
      };

      const result = await this._pool.query(query);

      return { ...result.rows[0] };
    } catch (error) {
      throw new NotFoundError("comment or thread not found");
    }
  }

  async deleteLikeCommentThread(likeComment) {
    const { credentialsId, threadId, commentId } = likeComment;
    const queryThread = {
      text: `SELECT * FROM thread_comments
        WHERE thread_id = $1
          AND id = $2`,
      values: [threadId, commentId],
    };

    const resultCheck = await this._pool.query(queryThread);
    console.log('result check ', resultCheck, likeComment);

    if (!resultCheck.rowCount) {
      throw new NotFoundError('comment or thread not found');
    }

    const query = {
      text: `DELETE FROM comment_likes
        WHERE owner = $1
          AND thread_id = $2
          AND comment_id = $3`,
      values: [credentialsId, threadId, commentId],
    };
    try {
      const result = await this._pool.query(query);
      console.log("result delete likes", result);
      return result.rows;
    } catch (error) {
      console.log("error delete likes", error);
      throw new NotFoundError("thread or comment not found");
    }
  }

  async getLikesById(likeComment) {
    const { credentialsId, threadId, commentId } = likeComment;
    const query = {
      text: `SELECT id,
                    created_at as date,
                    owner,
                    thread_id,
                    comment_id
        FROM comment_likes
        WHERE owner = $1
          AND thread_id = $2
          AND comment_id = $3`,
      values: [credentialsId, threadId, commentId],
    };

    const result = await this._pool.query(query);

    if (result.rowCount) {
      result.rows[0].date = new Date(result.rows[0].date).toISOString();
    }

    // always return array regardless if likes is found or not
    return result.rows;
  }

  async getLikeCount(commentId) {
    const query = {
      text: `SELECT COUNT(id) from comment_likes WHERE comment_id = $1`,
      values: [commentId],
    };

    const result = await this._pool.query(query);
    console.log("result total count ", result);

    return result.rows;
  }
}

module.exports = LikeRepositoryPostgres;
