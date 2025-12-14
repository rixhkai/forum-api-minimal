/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const RepliesTableTestHelper = {
  async addReplyCommentThread({
    id = 'tcreply-123', threadId = 'thread-123', content = 'new comment thread', owner = 'user-123',
    commentId = 'tc-123',
    created_at = new Date().toISOString()
  }) {
    const query = {
      text: "INSERT INTO thread_comments (id, content, thread_id, owner, created_at, comment_id) VALUES($1, $2, $3, $4, $5, $6) RETURNING id, content, owner",
      values: [id, content, threadId, owner, created_at, commentId],
    };

    await pool.query(query);
  },

  async findReplyCommentThreadById(replyId, threadId, commentId) {
    const query = {
      text: 'SELECT * FROM thread_comments WHERE id = $1 AND thread_id = $2 AND comment_id = $3',
      values: [replyId, threadId, commentId],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM thread_comments WHERE 1=1 AND comment_id is not null');
  },
};

module.exports = RepliesTableTestHelper;
