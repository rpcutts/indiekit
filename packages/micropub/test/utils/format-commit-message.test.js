const test = require('ava');

const formatCommitMessage = require('../../lib/utils/format-commit-message');

test('Creates commit message for given post action', t => {
  // Setup
  const postData = {
    type: 'note'
  };
  const pub = {
    'post-type-config': {
      note: {
        icon: ':notebook_with_decorative_cover:'
      }
    }
  };
  const message = {
    create: formatCommitMessage('create', postData, pub),
    delete: formatCommitMessage('delete', postData, pub),
    undelete: formatCommitMessage('undelete', postData, pub),
    update: formatCommitMessage('update', postData, pub),
    upload: formatCommitMessage('upload', postData, pub)
  };

  // Test assertions
  t.is(message.create, ':notebook_with_decorative_cover: Created note post');
  t.is(message.delete, ':x: Deleted note post');
  t.is(message.undelete, ':notebook_with_decorative_cover: Undeleted note post');
  t.is(message.update, ':notebook_with_decorative_cover: Updated note post');
  t.is(message.upload, ':framed_picture: Uploaded note');
});
