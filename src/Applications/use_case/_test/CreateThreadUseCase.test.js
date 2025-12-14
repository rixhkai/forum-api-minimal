const CreateThread = require("../../../Domains/threads/entities/CreateThread");
const ThreadRepository = require("../../../Domains/threads/ThreadRepository");
const CreateThreadUseCase = require("../CreateThreadUseCase");

describe("CreateThreadUseCase", () => {
  it('should throw error if use case payload not contain credentialsId', async () => {
    // Arrange
    const useCasePayload = {};
    const threadUseCase = new CreateThreadUseCase({});

    // Action & Assert
    await expect(threadUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('CREATE_THREAD_USE_CASE.NOT_CONTAIN_AUTH_TOKEN');
  });

  it('should throw error if use case payload not contain valid payload', async () => {
    // Arrange
    const useCasePayload = {credentialsId: 'user-123'};
    const threadUseCase = new CreateThreadUseCase({});

    // Action & Assert
    await expect(threadUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('CREATE_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it("should orchestrating the create thread action correctly", async () => {
    // Arrange
    const useCasePayload = {
      credentialsId: "user-123",
      title: "title thread",
      body: "body thread",
    };

    const mockCreatedThread = {
      id: "thread-123",
      title: useCasePayload.title,
      owner: "user-123",
    };

    /** creating dependency of use case */
    const mockThreadRepository = new ThreadRepository();

    /** mocking needed function */
    mockThreadRepository.createThread = jest
      .fn()
      .mockImplementation(() => Promise.resolve(mockCreatedThread));

    /** creating use case instance */
    const getThreadUseCase = new CreateThreadUseCase({
      threadRepository: mockThreadRepository,
    });

    // Action
    const createdThread = await getThreadUseCase.execute(useCasePayload);

    // Assert
    expect(createdThread).toStrictEqual({
      id: "thread-123",
      title: useCasePayload.title,
      owner: "user-123",
    });

    expect(mockThreadRepository.createThread).toBeCalledWith(
      new CreateThread({
        credentialsId: "user-123",
        title: "title thread",
        body: "body thread",
      })
    );
  });
});
