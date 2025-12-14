const pool = require('../../database/postgres/pool');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');
const LikesTableTestHelper = require('../../../../tests/LikesTableTestHelper');
const RepliesTableTestHelper = require('../../../../tests/RepliesTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  afterEach(async () => {
    await UsersTableTestHelper.cleanTable();
    await ThreadsTableTestHelper.cleanTable();
    await CommentsTableTestHelper.cleanTable();
    await RepliesTableTestHelper.cleanTable();
    await LikesTableTestHelper.cleanTable();
  });

  describe('when POST /threads', () => {
    it('should response 201 and persisted thread', async () => {
      // Arrange
      // eslint-disable-next-line no-undef
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
        title: 'new title thread',
        body: 'new body thread'
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
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
      expect(responseJson.data.addedThread).toBeDefined();
      expect(responseJson.data.addedThread.id).toBeDefined();
      expect(responseJson.data.addedThread.title).toBeDefined();
      expect(responseJson.data.addedThread.owner).toBeDefined();
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
      const requestPayload = {
        title: 'new title thread',
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${JSON.parse(loginResponse.payload).data.accessToken}`
        }
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(`can't create new thread because needed property is empty`);
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
      const requestPayload = {
        title: 'new title thread',
        body: 345
      };

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads',
        payload: requestPayload,
        headers: {
          Authorization: `Bearer ${JSON.parse(loginResponse.payload).data.accessToken}`
        }
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(400);
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual(`can't create new thread, wrong payload data type`);
    });
  });

  describe('when GET /threads/{threadId}', () => {
    it('should response 200 and thread without comment', async () => {
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
        method: 'GET',
        url: `/threads/${JSON.parse(responseThread.payload).data.addedThread.id}`,
        headers: {
          Authorization: `Bearer ${JSON.parse(loginResponse.payload).data.accessToken}`
        }
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(typeof responseJson).toBe('object');
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.id).toBeDefined();
      expect(responseJson.data.thread.title).toBeDefined();
      expect(responseJson.data.thread.title).toEqual('new title thread');
      expect(responseJson.data.thread.body).toBeDefined();
      expect(responseJson.data.thread.body).toEqual('new body thread');
      expect(responseJson.data.thread.username).toBeDefined();
      expect(responseJson.data.thread.username).toEqual('dicoding');
      expect(responseJson.data.thread.comments).toBeDefined();
      expect(responseJson.data.thread.comments).toEqual([]);
    });

    it('should response 200 and thread with 1 comment and empty replies', async () => {
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
      await server.inject({
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
        method: 'GET',
        url: `/threads/${JSON.parse(responseThread.payload).data.addedThread.id}`,
        headers: {
          Authorization: `Bearer ${JSON.parse(loginResponse.payload).data.accessToken}`
        }
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(typeof responseJson).toBe('object');
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.id).toBeDefined();
      expect(responseJson.data.thread.title).toBeDefined();
      expect(responseJson.data.thread.title).toEqual('new title thread');
      expect(responseJson.data.thread.body).toBeDefined();
      expect(responseJson.data.thread.body).toEqual('new body thread');
      expect(responseJson.data.thread.username).toBeDefined();
      expect(responseJson.data.thread.username).toEqual('dicoding');
      expect(responseJson.data.thread.comments).toBeDefined();
      expect(responseJson.data.thread.comments).toHaveLength(1);
      expect(responseJson.data.thread.comments[0].id).toBeDefined();
      expect(responseJson.data.thread.comments[0].username).toBeDefined();
      expect(responseJson.data.thread.comments[0].username).toEqual('dicoding');
      expect(responseJson.data.thread.comments[0].date).toBeDefined();
      expect(responseJson.data.thread.comments[0].content).toBeDefined();
      expect(responseJson.data.thread.comments[0].content).toEqual('new comment');
      expect(responseJson.data.thread.comments[0].likeCount).toBeDefined();
      expect(responseJson.data.thread.comments[0].likeCount).toEqual(0);
      expect(responseJson.data.thread.comments[0].replies).toBeDefined();
      expect(responseJson.data.thread.comments[0].replies).toEqual([]);
    });

    it('should response 200 and thread with 1 comment and 2 replies', async () => {
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
          fullname: 'Batman',
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
      // create comment reply
      await server.inject({
        method: 'POST',
        url: `/threads/${JSON.parse(responseThread.payload).data.addedThread.id}/comments/${JSON.parse(responseComment.payload).data.addedComment.id}/replies`,
        payload: {
          content: 'new comment reply'
        },
        headers: {
          Authorization: `Bearer ${JSON.parse(loginResponse.payload).data.accessToken}`
        }
      });
      await server.inject({
        method: 'POST',
        url: `/threads/${JSON.parse(responseThread.payload).data.addedThread.id}/comments/${JSON.parse(responseComment.payload).data.addedComment.id}/replies`,
        payload: {
          content: 'new comment reply batman'
        },
        headers: {
          Authorization: `Bearer ${JSON.parse(loginResponseBatman.payload).data.accessToken}`
        }
      });

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${JSON.parse(responseThread.payload).data.addedThread.id}`,
        headers: {
          Authorization: `Bearer ${JSON.parse(loginResponse.payload).data.accessToken}`
        }
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(typeof responseJson).toBe('object');
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.id).toBeDefined();
      expect(responseJson.data.thread.title).toBeDefined();
      expect(responseJson.data.thread.title).toEqual('new title thread');
      expect(responseJson.data.thread.body).toBeDefined();
      expect(responseJson.data.thread.body).toEqual('new body thread');
      expect(responseJson.data.thread.username).toBeDefined();
      expect(responseJson.data.thread.username).toEqual('dicoding');
      expect(responseJson.data.thread.comments).toBeDefined();
      expect(responseJson.data.thread.comments).toHaveLength(1);
      expect(responseJson.data.thread.comments[0].id).toBeDefined();
      expect(responseJson.data.thread.comments[0].username).toBeDefined();
      expect(responseJson.data.thread.comments[0].username).toEqual('dicoding');
      expect(responseJson.data.thread.comments[0].date).toBeDefined();
      expect(responseJson.data.thread.comments[0].content).toBeDefined();
      expect(responseJson.data.thread.comments[0].content).toEqual('new comment');
      expect(responseJson.data.thread.comments[0].likeCount).toBeDefined();
      expect(responseJson.data.thread.comments[0].likeCount).toEqual(0);
      expect(responseJson.data.thread.comments[0].replies).toBeDefined();
      expect(responseJson.data.thread.comments[0].replies).toHaveLength(2);
      expect(responseJson.data.thread.comments[0].replies[0].id).toBeDefined();
      expect(responseJson.data.thread.comments[0].replies[0].content).toBeDefined();
      expect(responseJson.data.thread.comments[0].replies[0].content).toEqual('new comment reply');
      expect(responseJson.data.thread.comments[0].replies[0].date).toBeDefined();
      expect(responseJson.data.thread.comments[0].replies[0].username).toBeDefined();
      expect(responseJson.data.thread.comments[0].replies[0].username).toEqual('dicoding');
      expect(responseJson.data.thread.comments[0].replies[1].id).toBeDefined();
      expect(responseJson.data.thread.comments[0].replies[1].content).toBeDefined();
      expect(responseJson.data.thread.comments[0].replies[1].content).toEqual('new comment reply batman');
      expect(responseJson.data.thread.comments[0].replies[1].date).toBeDefined();
      expect(responseJson.data.thread.comments[0].replies[1].username).toBeDefined();
      expect(responseJson.data.thread.comments[0].replies[1].username).toEqual('batman');
    });

    it('should response 200 and thread with 1 comment and 2 likes', async () => {
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
          fullname: 'Batman',
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
      // create like comment
      await server.inject({
        method: 'PUT',
        url: `/threads/${JSON.parse(responseThread.payload).data.addedThread.id}/comments/${JSON.parse(responseComment.payload).data.addedComment.id}/likes`,
        headers: {
          Authorization: `Bearer ${JSON.parse(loginResponse.payload).data.accessToken}`
        }
      });
      await server.inject({
        method: 'PUT',
        url: `/threads/${JSON.parse(responseThread.payload).data.addedThread.id}/comments/${JSON.parse(responseComment.payload).data.addedComment.id}/likes`,
        headers: {
          Authorization: `Bearer ${JSON.parse(loginResponseBatman.payload).data.accessToken}`
        }
      });

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${JSON.parse(responseThread.payload).data.addedThread.id}`,
        headers: {
          Authorization: `Bearer ${JSON.parse(loginResponse.payload).data.accessToken}`
        }
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(typeof responseJson).toBe('object');
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.id).toBeDefined();
      expect(responseJson.data.thread.title).toBeDefined();
      expect(responseJson.data.thread.title).toEqual('new title thread');
      expect(responseJson.data.thread.body).toBeDefined();
      expect(responseJson.data.thread.body).toEqual('new body thread');
      expect(responseJson.data.thread.username).toBeDefined();
      expect(responseJson.data.thread.username).toEqual('dicoding');
      expect(responseJson.data.thread.comments).toBeDefined();
      expect(responseJson.data.thread.comments).toHaveLength(1);
      expect(responseJson.data.thread.comments[0].id).toBeDefined();
      expect(responseJson.data.thread.comments[0].username).toBeDefined();
      expect(responseJson.data.thread.comments[0].username).toEqual('dicoding');
      expect(responseJson.data.thread.comments[0].date).toBeDefined();
      expect(responseJson.data.thread.comments[0].content).toBeDefined();
      expect(responseJson.data.thread.comments[0].content).toEqual('new comment');
      expect(responseJson.data.thread.comments[0].likeCount).toBeDefined();
      expect(responseJson.data.thread.comments[0].likeCount).toEqual(2);
      expect(responseJson.data.thread.comments[0].replies).toBeDefined();
      expect(responseJson.data.thread.comments[0].replies).toHaveLength(0);
    });

    it('should response 200 and thread with 1 comment and 1 likes after remove 1 like', async () => {
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
          fullname: 'Batman',
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
      // create like comment
      await server.inject({
        method: 'PUT',
        url: `/threads/${JSON.parse(responseThread.payload).data.addedThread.id}/comments/${JSON.parse(responseComment.payload).data.addedComment.id}/likes`,
        headers: {
          Authorization: `Bearer ${JSON.parse(loginResponse.payload).data.accessToken}`
        }
      });
      await server.inject({
        method: 'PUT',
        url: `/threads/${JSON.parse(responseThread.payload).data.addedThread.id}/comments/${JSON.parse(responseComment.payload).data.addedComment.id}/likes`,
        headers: {
          Authorization: `Bearer ${JSON.parse(loginResponseBatman.payload).data.accessToken}`
        }
      });
      await server.inject({
        method: 'PUT',
        url: `/threads/${JSON.parse(responseThread.payload).data.addedThread.id}/comments/${JSON.parse(responseComment.payload).data.addedComment.id}/likes`,
        headers: {
          Authorization: `Bearer ${JSON.parse(loginResponseBatman.payload).data.accessToken}`
        }
      });

      // Action
      const response = await server.inject({
        method: 'GET',
        url: `/threads/${JSON.parse(responseThread.payload).data.addedThread.id}`,
        headers: {
          Authorization: `Bearer ${JSON.parse(loginResponse.payload).data.accessToken}`
        }
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(typeof responseJson).toBe('object');
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.id).toBeDefined();
      expect(responseJson.data.thread.title).toBeDefined();
      expect(responseJson.data.thread.title).toEqual('new title thread');
      expect(responseJson.data.thread.body).toBeDefined();
      expect(responseJson.data.thread.body).toEqual('new body thread');
      expect(responseJson.data.thread.username).toBeDefined();
      expect(responseJson.data.thread.username).toEqual('dicoding');
      expect(responseJson.data.thread.comments).toBeDefined();
      expect(responseJson.data.thread.comments).toHaveLength(1);
      expect(responseJson.data.thread.comments[0].id).toBeDefined();
      expect(responseJson.data.thread.comments[0].username).toBeDefined();
      expect(responseJson.data.thread.comments[0].username).toEqual('dicoding');
      expect(responseJson.data.thread.comments[0].date).toBeDefined();
      expect(responseJson.data.thread.comments[0].content).toBeDefined();
      expect(responseJson.data.thread.comments[0].content).toEqual('new comment');
      expect(responseJson.data.thread.comments[0].likeCount).toBeDefined();
      expect(responseJson.data.thread.comments[0].likeCount).toEqual(1);
      expect(responseJson.data.thread.comments[0].replies).toBeDefined();
      expect(responseJson.data.thread.comments[0].replies).toHaveLength(0);
    });

    it('should response 404 with not found thread', async () => {
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
        method: 'GET',
        url: `/threads/xxx`,
        headers: {
          Authorization: `Bearer ${JSON.parse(loginResponse.payload).data.accessToken}`
        }
      });

      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(404);
      expect(typeof responseJson).toBe('object');
      expect(responseJson.status).toEqual('fail');
      expect(responseJson.message).toEqual('thread not found');
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
  });
});
