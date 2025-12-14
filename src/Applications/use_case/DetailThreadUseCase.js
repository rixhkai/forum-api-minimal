const NotFoundError = require("../../Commons/exceptions/NotFoundError");

class DetailThreadUseCase {
  constructor({
    threadRepository,
    commentRepository,
    repliesRepository,
    userRepository,
  }) {
    this._threadRepository = threadRepository;
    this._commentRepository = commentRepository;
    this._repliesRepository = repliesRepository;
    this._userRepository = userRepository;
  }

  // Get detail thread with multiple query instead 1 nested to optimize performance and times
  async execute(useCasePayload) {
    console.log("execute DetailThreadUseCase:", useCasePayload);
    this._validatePayload(useCasePayload);
    try {
      let detail = await this._threadRepository.getDetailThread(
        useCasePayload.threadId
      );
      detail.comments = [];
      const comments = await this._commentRepository.getCommentThread(
        detail.id
      );
      if (comments && comments.length != 0) {
        let allComment = comments.concat([]); // so original comment array not getting alter too
        const commentsId = comments.map((v) => {
          return v.id;
        });
        const replies = await this._repliesRepository.getAllReplyByCommentId(
          commentsId
        );
        if (replies && replies.length != 0) {
          allComment = allComment.concat(replies);
        }

        /* istanbul ignore next */
        const reduceCommentUser = allComment.reduce((unique, o) => {
          if (!unique.some((obj) => obj.owner == o.owner)) {
            unique.push(o.owner);
          }
          return unique;
        }, []);

        const users = await this._userRepository.getUserListById(
          reduceCommentUser
        );
        for (let item of comments) {
          /* istanbul ignore next */
          let comment = {
            id: item.id,
            content: !item.is_delete
              ? item.content
              : "**komentar telah dihapus**",
            date: new Date(item.date).toISOString(),
            username: item.owner,
            replies: [],
          };
          // Each assign reply to match parent comment
          for (let reply of replies) {
            // continue loop to next array if not match
            /* istanbul ignore next */
            if (reply.comment_id != item.id) {
              continue;
            }
            reply.username = "";
            // assign userame from user id for reply object
            loop3: for (let sub of users) {
              if (sub.id == reply.owner) {
                reply.username = sub.username;
                break loop3;
              }
            }
            /* istanbul ignore next */
            comment.replies.push({
              id: reply.id,
              content: !reply.is_delete
                ? reply.content
                : "**balasan telah dihapus**",
              date: new Date(reply.date).toISOString(),
              username: reply.username,
            });
          }
          // assign userame from user id for comment object
          loop2: for (let sub of users) {
            /* istanbul ignore next */
            if (sub.id == item.owner) {
              comment.username = sub.username;
              break loop2;
            }
          }
          detail.comments.push(comment);
        }
      }

      return detail;
    } catch (e) {
      console.log('check err detailusecase', e);
      throw new NotFoundError("thread not found");
    }
  }

  _validatePayload(payload) {
    const { threadId } = payload;
    if (!threadId) {
      throw new Error("DETAIL_THREAD_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY");
    }

    if (typeof threadId !== "string") {
      throw new Error(
        "DETAIL_THREAD_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION"
      );
    }
  }
}

module.exports = DetailThreadUseCase;
