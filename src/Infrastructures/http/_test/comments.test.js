const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads/{threadId}/comments endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
  });

  describe('when POST /threads/{threadId}/comments', () => {
    it('should response 201 and persisted comment thread', async () => {
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
      const requestPayload = {
        content: 'new comment thread'
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${JSON.parse(responseThread.payload).data.addedThread.id}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${JSON.parse(loginResponse.payload).data.accessToken}`
        }
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(201);
      expect(typeof responseJson).toBe('object');
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.addedComment).toBeDefined();
      expect(responseJson.data.addedComment.id).toBeDefined();
      expect(responseJson.data.addedComment.content).toBeDefined();
      expect(responseJson.data.addedComment.owner).toBeDefined();
    });

    it('should response 400 when request payload not contain needed property', async () => {
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
      const requestPayload = {};

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${JSON.parse(responseThread.payload).data.addedThread.id}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${JSON.parse(loginResponse.payload).data.accessToken}`
        }
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(`can't create new comment thread because needed property is empty`);
    });

    it('should response 400 when request payload not meet data type specification', async () => {
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
      const requestPayload = {
        content: []
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/${JSON.parse(responseThread.payload).data.addedThread.id}/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${JSON.parse(loginResponse.payload).data.accessToken}`
        }
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(`can't create new comment thread, wrong payload data type`);
    });

    it('should response 404 when thread not found', async () => {
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
      const requestPayload = {
        content: 'new comment'
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: `/threads/xxx/comments`,
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${JSON.parse(loginResponse.payload).data.accessToken}`
        }
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(`thread not found`);
    });
  });

  describe('when DELETE /threads/{threadId}/comments/{commentId}', () => {
    it('should response 200 status code', async () => {
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
        method: 'DELETE',
        url: `/threads/${JSON.parse(responseThread.payload).data.addedThread.id}/comments/${JSON.parse(responseComment.payload).data.addedComment.id}`,
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

    it('should response 401 with no authentication', async () => {
      // Arrange
      const server = await createServer(container);

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/xxx/comments/xxx`,
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(401);
      expect(responseJson.message).toEqual(`Missing authentication`);
    });

    it('should response 404 when comment not found', async () => {
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

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: `/threads/${JSON.parse(responseThread.payload).data.addedThread.id}/comments/xxx`,
        headers: {
          Authorization: `Bearer ${JSON.parse(loginResponse.payload).data.accessToken}`
        }
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(`comment thread not found`);
    });

    it('should response 403 with non owner of comment', async () => {
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
      await server.inject({
        method: 'POST',
        url: '/users',
        payload: {
          username: 'batman',
          password: 'secret',
          fullname: 'Bruce Wayne',
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
      const loginResponseBatman = await server.inject({
        method: 'POST',
        url: '/authentications',
        payload: {
          username: 'batman',
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
        method: 'DELETE',
        url: `/threads/${JSON.parse(responseThread.payload).data.addedThread.id}/comments/${JSON.parse(responseComment.payload).data.addedComment.id}`,
        headers: {
          Authorization: `Bearer ${JSON.parse(loginResponseBatman.payload).data.accessToken}`
        }
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(403);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(`not authorized to do this action`);
    });
  });
});
