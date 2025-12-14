/* istanbul ignore file */
const pool = require("../src/Infrastructures/database/postgres/pool");

const LikesTableTestHelper = {
  async likeCommentThread({
    id = "like-123",
    threadId = "thread-123",
    commentId = "tc-123",
    owner = "user-123",
    created_at = new Date().toISOString(),
  }) {
    const query = {
      text: "INSERT INTO comment_likes (id, thread_id, owner, created_at, comment_id) VALUES($1, $2, $3, $4, $5)",
      values: [id, threadId, owner, created_at, commentId],
    };

    await pool.query(query);
  },

  async findLikeCommentThreadById(credentialsId, threadId, commentId) {
    const query = {
      text: "SELECT * FROM comment_likes WHERE owner = $1 AND thread_id = $2 AND comment_id = $3",
      values: [credentialsId, threadId, commentId],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query("DELETE FROM comment_likes WHERE 1=1");
  },
};

module.exports = LikesTableTestHelper;
