const InvariantError = require('./InvariantError');
const AuthenticationError = require('./AuthenticationError');
const AuthorizationError = require('./AuthorizationError');

const DomainErrorTranslator = {
  translate(error) {
    return DomainErrorTranslator._directories[error.message] || error;
  },
};

DomainErrorTranslator._directories = {
  'REGISTER_USER.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('tidak dapat membuat user baru karena properti yang dibutuhkan tidak ada'),
  'REGISTER_USER.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('tidak dapat membuat user baru karena tipe data tidak sesuai'),
  'REGISTER_USER.USERNAME_LIMIT_CHAR': new InvariantError('tidak dapat membuat user baru karena karakter username melebihi batas limit'),
  'REGISTER_USER.USERNAME_CONTAIN_RESTRICTED_CHARACTER': new InvariantError('tidak dapat membuat user baru karena username mengandung karakter terlarang'),
  'USER_LOGIN.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError('harus mengirimkan username dan password'),
  'USER_LOGIN.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('username dan password harus string'),
  'REFRESH_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN': new InvariantError('harus mengirimkan token refresh'),
  'REFRESH_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('refresh token harus string'),
  'DELETE_AUTHENTICATION_USE_CASE.NOT_CONTAIN_REFRESH_TOKEN': new InvariantError('harus mengirimkan token refresh'),
  'DELETE_AUTHENTICATION_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError('refresh token harus string'),
  'CREATE_THREAD_USE_CASE.NOT_CONTAIN_AUTH_TOKEN': new AuthenticationError(`unauthenticated, can't create new thread`),
  'CREATE_THREAD.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError(`can't create new thread because needed property is empty`),
  'CREATE_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError(`can't create new thread, wrong payload data type`),
  'CREATE_COMMENT_THREAD_USE_CASE.NOT_CONTAIN_AUTH_TOKEN': new AuthenticationError(`unauthenticated, can't create new comment thread`),
  'CREATE_COMMENT_THREAD_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError(`can't create new comment thread because needed property is empty`),
  'CREATE_COMMENT_THREAD_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError(`can't create new comment thread, wrong payload data type`),
  'REPLY_COMMENT_THREAD_USE_CASE.NOT_CONTAIN_AUTH_TOKEN': new AuthenticationError(`unauthenticated, can't create new reply`),
  'REPLY_COMMENT_THREAD_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError(`can't create new reply because needed property is empty`),
  'REPLY_COMMENT_THREAD_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError(`can't create new reply, wrong payload data type`),
  'DELETE_COMMENT_THREAD_USE_CASE.NOT_CONTAIN_AUTH_TOKEN': new AuthenticationError(`unauthenticated, can't delete comment thread`),
  'DELETE_COMMENT_THREAD_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError(`can't delete comment thread because needed property is empty`),
  'DELETE_COMMENT_THREAD_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError(`can't delete comment thread, wrong payload data type`),
  'DELETE_REPLY_COMMENT_THREAD_USE_CASE.NOT_CONTAIN_AUTH_TOKEN': new AuthenticationError(`unauthenticated, can't delete reply comment thread`),
  'DELETE_REPLY_COMMENT_THREAD_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError(`can't delete reply comment thread because needed property is empty`),
  'DELETE_REPLY_COMMENT_THREAD_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError(`can't delete reply comment thread, wrong payload data type`),
  'DETAIL_THREAD_USE_CASE.NOT_CONTAIN_NEEDED_PROPERTY': new InvariantError(`can't get detail thread because thread id is empty`),
  'DETAIL_THREAD_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION': new InvariantError(`can't get detail thread, wrong payload data type`),
};

module.exports = DomainErrorTranslator;
