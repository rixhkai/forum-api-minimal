const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments/${commentId}/likes endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await LikesTableTestHelper.cleanTable();
  });

  describe('when PUT /threads/{threadId}/comments/${commentId}/likes', () => {
    it('should response 200 and persisted like comment', async () => {
      // Arrange
      const server = await createServer(container);
      //ADD USER
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });
      // login user
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });
      // create thread
      const responseThread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'new title thread',
          body: 'new body thread'
        },
        headers: {
          Authorization: `Bearer ${JSON.parse(loginResponse.payload).data.accessToken}`
        }
      });
      // create comment
      const responseComment = await server.inject({
        method: 'POST',
        url: `/threads/${JSON.parse(responseThread.payload).data.addedThread.id}/comments`,
        payload: {
          content: 'new comment'
        },
        headers: {
          Authorization: `Bearer ${JSON.parse(loginResponse.payload).data.accessToken}`
        }
      });

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${JSON.parse(responseThread.payload).data.addedThread.id}/comments/${JSON.parse(responseComment.payload).data.addedComment.id}/likes`,
        headers: {
          Authorization: `Bearer ${JSON.parse(loginResponse.payload).data.accessToken}`
        }
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(typeof responseJson).toBe('object');
      expect(responseJson.status).toEqual('success');
    });

    it('should response 200 when remove like comment', async () => {
      // Arrange
      const server = await createServer(container);
      //ADD USER
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });
      // login user
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });
      // create thread
      const responseThread = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: {
          title: 'new title thread',
          body: 'new body thread'
        },
        headers: {
          Authorization: `Bearer ${JSON.parse(loginResponse.payload).data.accessToken}`
        }
      });
      // create comment
      const responseComment = await server.inject({
        method: 'POST',
        url: `/threads/${JSON.parse(responseThread.payload).data.addedThread.id}/comments`,
        payload: {
          content: 'new comment'
        },
        headers: {
          Authorization: `Bearer ${JSON.parse(loginResponse.payload).data.accessToken}`
        }
      });

      // Action
      const responseLike = await server.inject({
        method: 'PUT',
        url: `/threads/${JSON.parse(responseThread.payload).data.addedThread.id}/comments/${JSON.parse(responseComment.payload).data.addedComment.id}/likes`,
        headers: {
          Authorization: `Bearer ${JSON.parse(loginResponse.payload).data.accessToken}`
        }
      });
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/${JSON.parse(responseThread.payload).data.addedThread.id}/comments/${JSON.parse(responseComment.payload).data.addedComment.id}/likes`,
        headers: {
          Authorization: `Bearer ${JSON.parse(loginResponse.payload).data.accessToken}`
        }
      });

      // Assert
      const responseJsonLike = JSON.parse(responseLike.payload);
      expect(responseLike.statusCode).toEqual(200);
      expect(typeof responseJsonLike).toBe('object');
      expect(responseJsonLike.status).toEqual('success');

      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(typeof responseJson).toBe('object');
      expect(responseJson.status).toEqual('success');
    });

    it('should response 404 when comment or thread not found', async () => {
      // Arrange
      const server = await createServer(container);
      //ADD USER
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'dicoding',
          password: 'secret',
          fullname: 'Dicoding Indonesia',
        },
      });
      // login user
      const loginResponse = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'dicoding',
          password: 'secret',
        },
      });

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: `/threads/xxx/comments/xxx/likes`,
        headers: {
          Authorization: `Bearer ${JSON.parse(loginResponse.payload).data.accessToken}`
        }
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(`comment or thread not found`);
    });
  });
});
