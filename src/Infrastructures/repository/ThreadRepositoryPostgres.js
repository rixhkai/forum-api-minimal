const AuthorizationError = require("../../Commons/exceptions/AuthorizationError");
const InvariantError = require("../../Commons/exceptions/InvariantError");
const NotFoundError = require("../../Commons/exceptions/NotFoundError");
const ThreadRepository = require("../../Domains/threads/ThreadRepository");

class ThreadRepositoryPostgres extends ThreadRepository {
  constructor(pool, idGenerator) {
    super();
    this._pool = pool;
    this._idGenerator = idGenerator;
  }

  async createThread(createThread) {
    const { credentialsId, title, body } = createThread;
    const id = `thread-${this._idGenerator()}`;
    const createdAt = new Date().toISOString();

    const query = {
      text: "INSERT INTO threads (id, title, body, owner, created_at) VALUES($1, $2, $3, $4, $5) RETURNING id, title, owner",
      values: [id, title, body, credentialsId, createdAt],
    };

    const result = await this._pool.query(query);

    return { ...result.rows[0] };
  }

  async getDetailThread(threadId) {
    console.log("getDetailThread: ThreadRepoPostgres", threadId);
    const query = {
      text: `SELECT threads.id,
                    threads.title,
                    threads.body,
                    threads.created_at as date,
                    users.username
      FROM threads
      INNER JOIN users
        ON users.id = threads.owner
      WHERE threads.id = $1`,
      values: [threadId],
    };

    const queryCommentList = {
      text: `SELECT tc.id,
                    tc.content,
                    tc.created_at as date,
                    tc.owner,
                    tc.comment_id,
                    tc.is_delete
      FROM thread_comments as tc
      WHERE tc.thread_id = $1 AND tc.comment_id is null
      ORDER BY tc.created_at ASC`,
      values: [threadId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError("thread not found");
    }
    // reformat as isostring
    result.rows[0].date = new Date(result.rows[0].date).toISOString();

    return result.rows[0];
  }
}

module.exports = ThreadRepositoryPostgres;
