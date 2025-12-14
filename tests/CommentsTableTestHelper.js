/* istanbul ignore file */
const pool = require('../src/Infrastructures/database/postgres/pool');

const CommentsTableTestHelper = {
  async addCommentThread({
    id = 'tc-123', threadId = 'thread-123', content = 'new comment thread', owner = 'user-123',
    created_at = new Date().toISOString()
  }) {
    const query = {
      text: "INSERT INTO thread_comments (id, content, thread_id, owner, created_at) VALUES($1, $2, $3, $4, $5) RETURNING id, content, owner",
      values: [id, content, threadId, owner, created_at],
    };

    await pool.query(query);
  },

  async findCommentThreadById(threadId, commentId) {
    const query = {
      text: 'SELECT * FROM thread_comments WHERE id = $1 AND thread_id = $2',
      values: [commentId, threadId],
    };

    const result = await pool.query(query);
    return result.rows;
  },

  async cleanTable() {
    await pool.query('DELETE FROM thread_comments WHERE 1=1 AND comment_id is null');
  },
};

module.exports = CommentsTableTestHelper;
